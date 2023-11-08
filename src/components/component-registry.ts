import { SXLGlobalContext } from "@/types/context";
import { DynamicController } from ".";

export const REGISTRY_SYMBOL = Symbol("DCRegistry");

type ComponentRegistry<G extends SXLGlobalContext> = Record<
  string,
  DynamicController<G>
>;

/**
 * A global state container for the list of dynamic components.
 *
 * LeanJSX middleware uses this registry to auto-configure the endpoints for each dynamic component.
 */
const registry: ComponentRegistry<SXLGlobalContext> = {};
global[REGISTRY_SYMBOL] = registry;

export function registerDynamicController<G extends SXLGlobalContext>(
  controller: DynamicController<G>
): DynamicController<G> {
  (global[REGISTRY_SYMBOL] as ComponentRegistry<G>)[controller.contentId] =
    controller;

  return controller;
}

export function getDynamicComponentRegistry<G extends SXLGlobalContext>() {
  return global[REGISTRY_SYMBOL] as ComponentRegistry<G>;
}
