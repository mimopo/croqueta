/**
 * Validates if an event name is a valid custom event name for the framework.
 *
 * Rules:
 * 1. Must not be empty.
 * 2. Must be lowercase (as the framework lowercases event names in templates).
 * 3. Must start with a letter.
 * 4. Must contain only lowercase letters, numbers, hyphens, or underscores.
 * 5. Must not start with 'on' (to avoid confusion with native event handlers).
 *
 * @param name The event name to validate.
 * @throws Error if the name is invalid.
 */
export function validateEventName(name: string): void {
  if (!name) {
    throw new Error('[Framework Error]: Event name cannot be empty.');
  }

  // Check for 'on' prefix
  if (name.startsWith('on')) {
    throw new Error(`[Framework Error]: Invalid event name "${name}". Custom event names should not start with "on".`);
  }

  // Regex: starts with a letter, followed by lowercase letters, numbers, hyphens or underscores
  const validNameRegex = /^[a-z][a-z0-9-_]*$/;
  if (!validNameRegex.test(name)) {
    throw new Error(
      `[Framework Error]: Invalid event name "${name}". ` +
        'Custom event names must be lowercase, start with a letter, and only contain lowercase letters, numbers, hyphens, or underscores.'
    );
  }
}
