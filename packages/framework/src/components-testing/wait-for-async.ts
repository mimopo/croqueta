/**
 * A testing utility that waits for the next macrotask to complete.
 * This is useful for waiting for component re-renders that are scheduled
 * with `setTimeout` to finish before making assertions in tests.
 *
 * @example
 * test('should update the view after a state change', async () => {
 *   const component = renderComponent(MyComponent);
 *   component.updateInputs({ value: 'new value' });
 *   await waitForRender();
 *   expect(component.textContent).toContain('new value');
 * });
 */
export async function waitForAsync() {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve());
  });
}
