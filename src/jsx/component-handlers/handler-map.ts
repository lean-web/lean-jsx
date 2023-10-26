import { ComponentHandler } from ".";
import { AsyncGenElementHandler } from "./impl/async-gen-component";
import { ClassElementHandler } from "./impl/class-component";
import { FnElementHandler } from "./impl/fn-component";
import { StaticElementHandler } from "./impl/static-component";

export const ComponentHandlerMap: ComponentHandler[] = [
    StaticElementHandler,
    ClassElementHandler,
    FnElementHandler,
    AsyncGenElementHandler
];
