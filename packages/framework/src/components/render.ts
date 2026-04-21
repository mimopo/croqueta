import { cleanup, registerEffect } from './effect';
import { repeater } from './repeat';
import { isRepeat, isSignal, isWritableSignal } from './utils';

/**
 * Applies an attribute to an element. Handles boolean attributes by removing them when false
 * @param el The element to apply the attribute to.
 * @param attrName The name of the attribute.
 * @param val The value of the attribute.
 */
function applyAttribute(el: HTMLElement, attrName: string, val: unknown) {
  if (val === false || val === undefined || val === null) {
    el.removeAttribute(attrName);
  } else {
    // oxlint-disable-next-line typescript/no-base-to-string
    el.setAttribute(attrName, String(val));
  }
}

/**
 * We use a WeakMap because the TemplateStringsArray is created for each tagged template literal
 */
const templateCache = new WeakMap<TemplateStringsArray, HTMLTemplateElement>();

/**
 * Returns true if the accumulated HTML string ends inside an open attribute value
 * (i.e. there is an unmatched `="` that hasn't been closed by a subsequent `"`).
 */
function isInsideAttribute(accumulated: string): boolean {
  // Walk backwards from the end looking for the last `="`.
  // If found, count the `"` characters after it — if there are none, we're inside the attribute.
  const lastAttrOpen = accumulated.lastIndexOf('="');
  if (lastAttrOpen === -1) return false;
  // Everything after the `="` opening
  const afterOpen = accumulated.slice(lastAttrOpen + 2);
  // If there's no closing `"` after the opening, we're still inside the attribute value
  return !afterOpen.includes('"');
}

/**
 * Parses a template literal into a template element.
 * @param strings The template literal strings.
 * @param values The values to interpolate into the template literal.
 * @returns The parsed template element.
 */
function parseTemplate(strings: TemplateStringsArray, values: unknown[]) {
  const template = document.createElement('template');
  // 1. Build the HTML string with Comment Markers
  // We use as a marker for dynamic holes
  const processedHtml = strings.reduce((acc, str, i) => {
    let placeholder = '';

    if (i < values.length) {
      // Check if this hole is inside an attribute value or a text node
      const accumulated = acc + str;
      if (isInsideAttribute(accumulated)) {
        placeholder = `__attr_${i}__`;
      } else {
        placeholder = `<!--m${i}-->`;
      }
    }
    return acc + str + placeholder;
  }, '');

  template.innerHTML = processedHtml;
  return template;
}

/**
 * Handles event bindings.
 * @param el The element to bind the event to.
 * @param attrName The name of the event.
 * @param val The event handler.
 */
function eventBinding(el: HTMLElement, attrName: string, val: unknown) {
  const eventName = attrName.slice(1, -1).toLowerCase();
  if (typeof val !== 'function') {
    throw new Error(`[Framework Error]: Event handler "${eventName}" must be a function.`);
  }
  el.addEventListener(eventName, (e) => {
    val(e instanceof CustomEvent ? e.detail : e);
  });
}

/**
 * Handles two-way data bindings.
 * @param el The element to bind the two-way data binding to.
 * @param attrName The name of the property to bind.
 * @param val The signal to bind.
 */
function twoWayBinding(el: HTMLElement, attrName: string, val: unknown) {
  const propertyName = attrName.slice(2, -2).toLowerCase();
  if (!isWritableSignal(val)) {
    throw new Error(`[Framework Error]: Two way data binding on "${propertyName}" must be a writable Signal.`);
  }
  registerEffect(el, () => {
    (el as any)[propertyName] = val.get();
  });
  el.addEventListener(`${propertyName}-change`, (e) => {
    if (e instanceof CustomEvent) {
      val.set(e.detail);
    }
  });
}

function propertyBinding(el: HTMLElement, attrName: string, val: unknown) {
  const propertyName = attrName.slice(1, -1);
  if (isSignal(val)) {
    registerEffect(el, () => {
      (el as any)[propertyName] = val.get();
    });
  } else {
    (el as any)[propertyName] = val;
  }
}

/**
 * Handles attribute bindings.
 * @param el The element to bind the attribute to.
 * @param attrName The name of the attribute to bind.
 * @param val The value to bind.
 */
function attributeBinding(el: HTMLElement, attrName: string, val: unknown) {
  if (isSignal(val)) {
    registerEffect(el, () => {
      applyAttribute(el, attrName, val.get());
    });
  } else {
    applyAttribute(el, attrName, val);
  }
}

/**
 * Renders a template literal to the DOM.
 * @param strings The template literal strings.
 * @param values The values to interpolate into the template literal.
 * @returns The rendered template literal.
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): DocumentFragment {
  let template = templateCache.get(strings);
  if (!template) {
    template = parseTemplate(strings, values);
    templateCache.set(strings, template);
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- cloneNode over a DocumentFragment will always return a DocumentFragment
  const fragment: DocumentFragment = template.content.cloneNode(true) as DocumentFragment;

  // 2. Hydrate the fragment
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node instanceof HTMLElement) {
      const el = node;
      // We copy attributes to an array because we might remove them during iteration
      for (const attr of Array.from(el.attributes)) {
        const attrName = attr.name;
        const attrValue = attr.value;

        // Check if the value contains any markers like __attr_0__
        const matches = attrValue.match(/__attr_(\d+)__/g);
        if (matches) {
          // A. Special bindings or exact placeholder match (no mixed text)
          if (attrName.startsWith('(') || attrName.startsWith('[') || (matches.length === 1 && attrValue === matches[0])) {
            const i = parseInt(matches[0].match(/\d+/)![0], 10);
            const val = values[i];
            el.removeAttribute(attrName);
            if (attrName.startsWith('(') && attrName.endsWith(')')) {
              eventBinding(el, attrName, val);
            } else if (attrName.startsWith('[(') && attrName.endsWith(')]')) {
              twoWayBinding(el, attrName, val);
            } else if (attrName.startsWith('[') && attrName.endsWith(']')) {
              propertyBinding(el, attrName, val);
            } else {
              attributeBinding(el, attrName, val);
            }
          } else {
            // B. Mixed attribute value (e.g. src="https://example.com/__attr_0__")
            const indices = matches.map((m) => parseInt(m.match(/\d+/)![0], 10));
            const update = () => {
              let finalValue = attrValue;
              indices.forEach((idx) => {
                const v = values[idx];
                const val = isSignal(v) ? v.get() : v;
                finalValue = finalValue.replace(`__attr_${idx}__`, String(val));
              });
              applyAttribute(el, attrName, finalValue);
            };

            if (indices.some((idx) => isSignal(values[idx]))) {
              registerEffect(el, update);
            } else {
              update();
            }
          }
        }
      }
    } else if (node.nodeType === Node.COMMENT_NODE) {
      const comment = node as Comment;
      const match = comment.textContent?.match(/^m(\d+)$/);
      if (match) {
        const i = parseInt(match[1], 10);
        const val = values[i];

        if (isRepeat(val)) {
          repeater(val, comment);
        } else if (isSignal(val)) {
          const anchor = comment as ChildNode;
          let currentNodes: Node[] = [];
          registerEffect(anchor, () => {
            const v = val.get();
            const parent = anchor.parentNode;
            if (!parent) return;

            // 1. Cleanup old nodes
            currentNodes.forEach((n) => {
              cleanup(n);
              if (n.parentNode) {
                n.parentNode.removeChild(n);
              }
            });
            currentNodes = [];

            // 2. Insert new content
            if (v instanceof Node) {
              const nodes = v instanceof DocumentFragment ? Array.from(v.childNodes) : [v];
              nodes.forEach((n) => parent.insertBefore(n, anchor));
              currentNodes = nodes;
            } else {
              const textNode = document.createTextNode(String(v));
              parent.insertBefore(textNode, anchor);
              currentNodes = [textNode];
            }
          });
        } else if (val instanceof Node) {
          comment.replaceWith(val);
        } else {
          comment.replaceWith(document.createTextNode(String(val)));
        }
      }
    }
  }

  return fragment;
}
