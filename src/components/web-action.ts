import { EventHandlerKeys } from "@/jsx/context/eventHandlerMap";

/**
 * Utility that allows component developers to explicitely pass data to the browser
 * for a given event handler (e.g. onclick) in a JSX element.
 *
 * @param data the data to pass to the browser
 * @param handler the original handler
 * @returns a web action handler, used internall by LeanJSX
 *  during render.
 */
export function webAction<
  Ev extends Event,
  Data extends Record<string, unknown>
>(
  data: Data,
  handler: (
    this: GlobalEventHandlers | null,
    ev?: Event,
    data?: Data
  ) => unknown
): SXL.WebHandler<Ev, Data> {
  return {
    handler: handler,
    data,
  };
}

/**
 * Checks if a property tuple is a web handler with data.
 * @param pair [key, value]
 * @returns true if value is a web handler
 */
export function isWebHandler(pair:
    [key: string,
    value: unknown]
  ): pair is [string, SXL.WebHandler<Event, Record<string, unknown>>] {
      const [key, value] = pair
    if (!value || !key || !EventHandlerKeys[key]) {
      return false;
    }
    if (typeof value === "object") {
      return "handler" in value && "data" in value;
    }
    return false;
  }
  
  
  /**
   * Checks if a property tuple is a pure function (no external data used)
   * @param pair [key, value]
   * @returns true if the event handler is a pure function
   */
  export function isPureActionHandler(pair:
      [key: string,
      value: unknown]
    ): pair is [keyof GlobalEventHandlers, NonNullable<GlobalEventHandlers[keyof GlobalEventHandlers]>] {
      const [key, value] = pair
      return key in EventHandlerKeys && typeof value === 'function'
    }