import { StylesService, css, inject, registerComponent } from '@mimopo/croqueta';

import { CodeGroupComponent } from './code-group.component';

// Allow Material Icons inside the components
inject(StylesService).addGlobalStyles(css`
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    vertical-align: middle;
    font-size: 1em;
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }
`);

registerComponent(CodeGroupComponent);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', current);
  localStorage.setItem('croqueta-docs-theme', current);
}

function toggleNav(btn: HTMLElement) {
  const nav = document.getElementById('nav');
  if (!nav) return;
  btn.classList.toggle('active');
  nav.classList.toggle('active');
}

Object.assign(window, {
  toggleTheme,
  toggleNav,
});
