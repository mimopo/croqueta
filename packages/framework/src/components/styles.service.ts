import type { Destroy } from '../di';
import type { ComponentStatic } from './types';

/**
 * A service responsible for managing and applying component styles.
 * It supports both Shadow DOM (via adoptedStyleSheets for performance) and
 * light DOM (by injecting <style> tags into the document head).
 * This service is designed to be a singleton within the application's injector.
 */
export class StylesService implements Destroy {
  /**
   * Caches CSSStyleSheet objects, keyed by component tag name.
   * Used for Shadow DOM components to leverage adoptedStyleSheets.
   */
  private stylesheets = new Map<string, CSSStyleSheet>();

  /**
   * Caches <style> elements, keyed by component tag name.
   * Used for light DOM components to avoid injecting duplicate style tags.
   */
  private styles = new Map<string, HTMLStyleElement>();

  /**
   * Caches global style strings to be applied to components.
   */
  private global: string = '';

  /**
   * Cleans up the service by clearing caches and removing any globally
   * injected <style> elements from the document head.
   * This is part of the `Destroy` lifecycle and is called when the application is torn down.
   */
  public destroy(): void {
    this.stylesheets.clear();
    for (const [, style] of this.styles) {
      style.remove();
    }
    this.styles.clear();
  }

  /**
   * Adds global CSS styles that will be applied to all components.
   * This method must be called before any components are rendered to ensure
   * styles are applied correctly.
   * @param styles Strings containing the CSS rules to be applied globally.
   */
  public addGlobalStyles(...styles: string[]) {
    if (this.stylesheets.size || this.styles.size) {
      throw new Error(`Global styles must be registered before loading components`);
    }
    const content = styles.join('\n');
    this.global = this.global ? `${this.global}\n${content}` : content;
  }

  /**
   * Applies styles to a component's root.
   * If the root is a ShadowRoot, it uses adoptedStyleSheets for optimal performance.
   * If the root is a regular HTMLElement (light DOM), it injects a <style> tag
   * into the document head, scoped to the component's tag.
   * @param root The root element or shadow root to which styles will be applied.
   * @param componentConstructor An object containing the component's static `tag` and `styles`.
   */
  public applyStyles(root: HTMLElement | ShadowRoot, componentConstructor: Pick<ComponentStatic, 'styles' | 'tag'>) {
    if (root instanceof ShadowRoot) {
      const stylesheets: CSSStyleSheet[] = [];
      if (this.global) {
        stylesheets.push(this.getStylesheet('global', this.global));
      }
      if (componentConstructor.styles) {
        stylesheets.push(this.getStylesheet(componentConstructor.tag, componentConstructor.styles));
      }
      if (stylesheets.length) {
        root.adoptedStyleSheets = stylesheets;
      }
    } else {
      this.registerGlobalStyle(componentConstructor.tag);
      if (componentConstructor.styles) {
        this.registerStyle(componentConstructor.tag, componentConstructor.styles);
      }
    }
  }

  /**
   * Retrieves a cached CSSStyleSheet for a given component tag, or creates
   * and caches a new one if it doesn't exist. This avoids re-parsing the same
   * style string for multiple instances of the same component.
   * @param componentTag The tag name of the component, used as a cache key.
   * @param styles The CSS style string to apply.
   * @returns A `CSSStyleSheet` instance.
   */
  private getStylesheet(componentTag: string, styles: string) {
    let sheet = this.stylesheets.get(componentTag);
    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(styles);
      this.stylesheets.set(componentTag, sheet);
    }
    return sheet;
  }

  /**
   * Creates and injects a `<style>` element into the document's head for components
   * that render in the light DOM. The styles are scoped to the component's tag name.
   * It ensures that styles for a given component tag are only registered once.
   * @param componentTag The tag name of the component, used as a cache key and for scoping.
   * @param styles The CSS style string to apply.
   */
  private registerStyle(componentTag: string, styles: string) {
    if (this.styles.has(componentTag)) {
      return;
    }
    const style = document.createElement('style');
    style.innerHTML = `${componentTag} { ${styles} }`;
    document.head.appendChild(style);
    this.styles.set(componentTag, style);
  }

  /**
   * Registers the global styles for a light DOM component.
   * It creates a single `<style>` tag for global styles and updates it
   * with the component's tag name to extend the style's scope.
   * @param componentTag The tag name of the component to add to the global style scope.
   */
  private registerGlobalStyle(componentTag: string) {
    if (!this.global || this.styles.has(componentTag)) {
      return;
    }
    let style = this.styles.get('global');
    if (style) {
      style.innerHTML = `${componentTag}, ${style.innerHTML}`;
    } else {
      style = document.createElement('style');
      style.innerHTML = `${componentTag} { ${this.global} }`;
      document.head.appendChild(style);
      this.styles.set('global', style);
    }
  }
}
