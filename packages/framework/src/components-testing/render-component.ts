import { type Component, type ComponentConstructor, registerComponent } from '../components';
import { render } from './render';

interface RenderComponentConfig {
  inputs?: Record<string, unknown>;
  attrs?: Record<string, string>;
}

/**
 * Renders a component to the document body.
 * @param component The component to render.
 * @param props The properties to set on the component.
 * @returns The rendered component.
 */
export function renderComponent<T extends Component>(component: ComponentConstructor<T>, props: RenderComponentConfig = {}): T {
  registerComponent(component);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- we know the element is of type T because we just registered it
  const element = document.createElement(component.tag) as T;
  if (props.inputs) {
    Object.assign(element, props.inputs);
  }
  if (props.attrs) {
    for (const attr in props.attrs) {
      element.setAttribute(attr, props.attrs[attr]);
    }
  }
  return render(element);
}
