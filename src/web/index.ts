import { WebActions } from "lean-web-utils/server";
import { DynamicComponent, addEventListener } from "lean-web-utils/web";
import { fillPlaceHolder, actionHandler } from "./wiring";

/**
 * Client-side utilities for dynamic behavior.
 *
 * These are bundled as an IIFE module under the namespace "sxl".
 *
 * Anything that is expected to be accessible in event handlers and other
 * code running on the client-side, needs to be exported here.
 */
export {
  // utilities for rendering lazy-loaded content:
  fillPlaceHolder,
  addEventListener,
  actionHandler,
  // web actions exposed on event handlers
  WebActions,
  DynamicComponent,
};
