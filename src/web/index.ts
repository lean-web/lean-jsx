import { DynamicComponent, refetchElement } from "./component";
import { fillPlaceHolder } from "./wiring";

DynamicComponent.register();

export { fillPlaceHolder, refetchElement, DynamicComponent };
