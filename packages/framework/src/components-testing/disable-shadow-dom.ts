// oxlint-disable-next-line typescript/unbound-method
const attachShadow = Element.prototype.attachShadow;

/**
 * Disables the shadow DOM for testing purposes.
 * This is useful for testing components that use the shadow DOM.
 * You can use this function in your test setup or just call it before the test.
 */
export function disableShadowDom() {
  Element.prototype.attachShadow = function () {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return this as unknown as ShadowRoot;
  };
}

/**
 * Enables the shadow DOM if you disabled it before.
 */
export function enableShadowDom() {
  Element.prototype.attachShadow = attachShadow;
}
