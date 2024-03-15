import type { DynamicController } from "./dynamic-controller";

export const REGISTRY_SYMBOL = Symbol("DCRegistry");

type ComponentRegistry<Props extends SXL.Props<object> = SXL.Props<object>> =
  Record<string, DynamicController<Props>>;

/**
 * A global state container for the list of dynamic components.
 *
 * LeanJSX middleware uses this registry to auto-configure the endpoints for each dynamic component.
 */
const registry: ComponentRegistry = {};
global[REGISTRY_SYMBOL] = registry;

export function registerAPIComponent<
  Props extends SXL.Props<object> = SXL.Props<object>,
>(controller: DynamicController<Props>): DynamicController<Props> {
  (global[REGISTRY_SYMBOL] as ComponentRegistry<Props>)[controller.contentId] =
    controller;
  return controller;
}

export function getDynamicComponentRegistry() {
  return global[REGISTRY_SYMBOL] as ComponentRegistry;
}

export function findAPIComponentController(
  id: string,
): DynamicController<object> {
  const registry = global[REGISTRY_SYMBOL] as ComponentRegistry<object>;
  return registry[id];
}
