import type { Route, RouteParams } from '../types';

export async function resolveData(route: Route, params: RouteParams): Promise<Record<string, unknown>> {
  if (!route.data) {
    return {};
  }
  const inputs: Record<string, unknown> = {};
  const promises = Object.entries(route.data).map(async ([key, fn]) => {
    const value = await fn(params);
    return { key, value };
  });
  for (const { key, value } of await Promise.all(promises)) {
    inputs[key] = value;
  }
  return inputs;
}
