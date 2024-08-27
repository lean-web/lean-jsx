export * from "@/components/index";
import type { IWebActions } from "lean-jsx-types/events";

/**
 * Utility that allows component developers to explicitely pass data to the browser
 * for a given event handler (e.g. onclick) in a JSX element.
 *
 * @param data the data to pass to the browser
 * @param handler - a function that receives two parameters (on the client side):
 * - The Event object from the listener.
 * - An object containing API-components actions
 * - A context object with access to the server-passed data.
 * @returns a web action handler, used internall by LeanJSX
 *  during render.
 */
export function withClientData<
    Ev extends Event,
    Data extends Record<string, unknown>,
>(
    data: Data,
    handler: (
        this: Element | GlobalEventHandlers | null,
        ev: Ev,
        actions: IWebActions,
        data: Data,
    ) => unknown,
): SXL.WebHandler<Ev, Data> {
    return {
        handler: handler,
        data,
    };
}
