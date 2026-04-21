import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { clear, enableShadowDom } from '../components-testing';
import { StylesService } from './styles.service';

describe('StylesService', () => {
  let service: StylesService;

  beforeEach(() => {
    enableShadowDom();
    service = new StylesService();
  });

  afterEach(() => {
    service.destroy();
    clear();
  });

  test('should not do anything if component has no styles', () => {
    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [];
    const component = { tag: 'no-style-comp', styles: undefined };
    service.applyStyles(shadowRoot, component as any);
    expect(shadowRoot.adoptedStyleSheets).toHaveLength(0);
    expect(document.head.querySelector('style')).toBeNull();
  });

  describe('applyStyles with ShadowRoot', () => {
    let host: HTMLElement;
    let shadowRoot: ShadowRoot;

    beforeEach(() => {
      host = document.createElement('div');
      shadowRoot = host.attachShadow({ mode: 'open' });
    });

    test('should create and apply a new stylesheet to a shadow root', () => {
      const component = { tag: 'test-shadow-comp', styles: 'color: red;' };
      service.applyStyles(shadowRoot, component);
      expect(shadowRoot.adoptedStyleSheets).toHaveLength(1);
      const sheet = shadowRoot.adoptedStyleSheets[0];
      expect(sheet).toBeInstanceOf(CSSStyleSheet);
      expect(sheet.replaceSync).toHaveBeenCalledExactlyOnceWith(component.styles);
    });

    test('should cache and reuse stylesheets for the same component tag', () => {
      const component = { tag: 'test-shadow-comp', styles: 'color: red;' };
      service.applyStyles(shadowRoot, component);
      const firstSheet = shadowRoot.adoptedStyleSheets[0];
      const anotherHost = document.createElement('div');
      const anotherShadowRoot = anotherHost.attachShadow({ mode: 'open' });
      service.applyStyles(anotherShadowRoot, component);
      const secondSheet = anotherShadowRoot.adoptedStyleSheets[0];
      expect(secondSheet).toBe(firstSheet);
    });
  });

  describe('applyStyles with light DOM (HTMLElement)', () => {
    let host: HTMLElement;

    beforeEach(() => {
      host = document.createElement('div');
    });

    test('should create and inject a <style> tag into the document head', () => {
      const component = { tag: 'test-light-comp', styles: 'color: blue;' };
      service.applyStyles(host, component);
      const styleElement = document.head.querySelector('style');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.innerHTML).toContain('test-light-comp');
      expect(styleElement?.innerHTML).toContain('color: blue;');
    });

    test('should only inject one <style> tag for the same component tag', () => {
      const component = { tag: 'test-light-comp', styles: 'color: blue;' };
      service.applyStyles(host, component);
      const anotherHost = document.createElement('div');
      service.applyStyles(anotherHost, component);
      const styleElements = document.head.querySelectorAll('style');
      expect(styleElements).toHaveLength(1);
    });
  });

  describe('destroy', () => {
    test('should remove injected <style> elements from the head', () => {
      const lightDomComp = { tag: 'light-comp', styles: 'font-size: 16px;' };
      service.applyStyles(document.createElement('div'), lightDomComp);
      expect(document.head.querySelector('style')).not.toBeNull();
      service.destroy();
      expect(document.head.querySelector('style')).toBeNull();
    });

    test('should clear internal caches', () => {
      const shadowComp = { tag: 'shadow-comp', styles: 'display: block;' };
      const lightComp = { tag: 'light-comp', styles: 'display: flex;' };
      service.applyStyles(document.createElement('div').attachShadow({ mode: 'open' }), shadowComp);
      service.applyStyles(document.createElement('div'), lightComp);
      service.destroy();
      expect((service as any).stylesheets.size).toBe(0);
      expect((service as any).styles.size).toBe(0);
    });
  });

  describe('global styles', () => {
    const globalStyles1 = 'body { margin: 0; }';
    const globalStyles2 = 'div { display: block; }';

    test('should throw an error if global styles are added after component styles are applied', () => {
      const component = { tag: 'test-comp', styles: 'color: red;' };
      service.applyStyles(document.createElement('div'), component);
      expect(() => service.addGlobalStyles(globalStyles1)).toThrow('Global styles must be registered before loading components');
    });

    describe('with Shadow DOM', () => {
      let host: HTMLElement;
      let shadowRoot: ShadowRoot;

      beforeEach(() => {
        host = document.createElement('div');
        shadowRoot = host.attachShadow({ mode: 'open' });
      });

      test('should apply global styles to a shadow root', () => {
        service.addGlobalStyles(globalStyles1);
        const component = { tag: 'test-shadow-comp', styles: 'color: red;' };
        service.applyStyles(shadowRoot, component);
        expect(shadowRoot.adoptedStyleSheets).toHaveLength(2);
        const [globalSheet, componentSheet] = shadowRoot.adoptedStyleSheets;
        expect(globalSheet).toBeInstanceOf(CSSStyleSheet);
        expect(globalSheet.replaceSync).toHaveBeenCalledExactlyOnceWith(globalStyles1);
        expect(componentSheet).toBeInstanceOf(CSSStyleSheet);
        expect(componentSheet.replaceSync).toHaveBeenCalledExactlyOnceWith(component.styles);
      });

      test('should apply multiple global styles and cache the result', () => {
        service.addGlobalStyles(globalStyles1);
        service.addGlobalStyles(globalStyles2);
        const component = { tag: 'test-shadow-comp', styles: 'color: red;' };
        service.applyStyles(shadowRoot, component);
        expect(shadowRoot.adoptedStyleSheets).toHaveLength(2);
        const globalSheet = shadowRoot.adoptedStyleSheets[0];
        expect(globalSheet.replaceSync).toHaveBeenCalledWith(`${globalStyles1}\n${globalStyles2}`);
        const anotherHost = document.createElement('div');
        const anotherShadowRoot = anotherHost.attachShadow({ mode: 'open' });
        service.applyStyles(anotherShadowRoot, component);
        expect(anotherShadowRoot.adoptedStyleSheets[0]).toBe(globalSheet);
      });
    });

    describe('with Light DOM', () => {
      test('should create a single <style> tag for global styles and add component tags to it', () => {
        service.addGlobalStyles(globalStyles1);
        const component1 = { tag: 'light-comp-1', styles: 'color: red;' };
        service.applyStyles(document.createElement('div'), component1);
        let styles = document.head.getElementsByTagName('style');
        expect(styles.length).toBe(2);
        expect(styles[0].innerHTML).toBe(`light-comp-1 { ${globalStyles1} }`);
        const component2 = { tag: 'light-comp-2', styles: 'color: blue;' };
        service.applyStyles(document.createElement('div'), component2);
        styles = document.head.getElementsByTagName('style');
        expect(styles.length).toBe(3);
        expect(styles[0].innerHTML).toBe(`light-comp-2, light-comp-1 { ${globalStyles1} }`);
      });

      test('should not add a component tag to global styles if it is already present', () => {
        service.addGlobalStyles(globalStyles1);
        const component1 = { tag: 'light-comp-1', styles: 'color: red;' };
        service.applyStyles(document.createElement('div'), component1);
        service.applyStyles(document.createElement('div'), component1); // Apply again
        const styles = document.head.getElementsByTagName('style');
        expect(styles.length).toBe(2);
        expect(styles[0].innerHTML).toBe(`light-comp-1 { ${globalStyles1} }`);
      });
    });
  });
});
