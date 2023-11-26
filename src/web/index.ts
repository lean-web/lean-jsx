import { update, refetchElement } from "lean-web-utils/lib/server";
import { DynamicComponent, addEventListener } from "lean-web-utils/lib/web";
import { fillPlaceHolder, actionHandler } from "./wiring";

DynamicComponent.register();

export {
  fillPlaceHolder,
  addEventListener,
  actionHandler,
  refetchElement,
  update,
  DynamicComponent,
};
