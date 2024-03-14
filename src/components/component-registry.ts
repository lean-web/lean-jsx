import { SXLGlobalContext } from "lean-jsx-types/context";
import { DynamicController } from "./dynamic-controller";

export const REGISTRY_SYMBOL = Symbol("DCRegistry");

type ComponentRegistry<
  GContext extends SXLGlobalContext,
  Props extends SXL.Props<object, GContext> = SXL.Props<object, GContext>,
> = Record<string, DynamicController<GContext, Props>>;

/**
 * A global state container for the list of dynamic components.
 *
 * LeanJSX middleware uses this registry to auto-configure the endpoints for each dynamic component.
 */
const registry: ComponentRegistry<SXLGlobalContext> = {};
global[REGISTRY_SYMBOL] = registry;

export function registerAPIComponent<
  GContext extends SXLGlobalContext,
  Props extends SXL.Props<object, GContext> = SXL.Props<object, GContext>,
>(
  controller: DynamicController<GContext, Props>,
): DynamicController<GContext, Props> {
  (global[REGISTRY_SYMBOL] as ComponentRegistry<GContext, Props>)[
    controller.contentId
  ] = controller;
  return controller;
}

export function getDynamicComponentRegistry<
  GContext extends SXLGlobalContext,
  Props extends SXL.Props<object, GContext> = SXL.Props<object, GContext>,
>() {
  return global[REGISTRY_SYMBOL] as ComponentRegistry<GContext, Props>;
}

export function findAPIComponentController(
  id: string,
): DynamicController<SXLGlobalContext, object> {
  const registry = global[REGISTRY_SYMBOL] as ComponentRegistry<
    SXLGlobalContext,
    object
  >;

  return registry[id];
}
