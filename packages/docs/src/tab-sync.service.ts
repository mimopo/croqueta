import { effect, signal } from '@mimopo/croqueta';

/**
 * Sync tabs between code groups
 */
export class TabSyncService {
  active = signal('');
  private readonly storageKey = 'croqueta-docs-language';
  constructor() {
    const language = localStorage.getItem(this.storageKey);
    if (language) {
      this.active.set(language);
    }
    effect(() => {
      localStorage.setItem(this.storageKey, this.active.get());
    });
  }
}
