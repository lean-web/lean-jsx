import { type ComponentHandler } from ".";
import { AsyncGenElementHandler } from "./impl/async-gen-component";
import { ClassElementHandler } from "./impl/class-component";
import { FnElementHandler } from "./impl/fn-component";
import { StaticElementHandler } from "./impl/static-component";

/**
 * A list of handlers for supported component types.
 */
export const ComponentHandlerMap: ComponentHandler[] = [
  StaticElementHandler,
  ClassElementHandler,
  FnElementHandler,
  AsyncGenElementHandler,
];
