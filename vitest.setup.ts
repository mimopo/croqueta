// oxlint-disable-next-line no-restricted-imports
import '@testing-library/jest-dom/vitest';
import { disableShadowDom } from '@mimopo/croqueta/testing';
import { vi } from 'vitest';

const CSSStyleSheetMock = vi.fn(
  class CSSStyleSheetMock extends CSSStyleSheet {
    replaceSync = vi.fn();
  }
);
vi.stubGlobal('CSSStyleSheet', CSSStyleSheetMock);

disableShadowDom();
