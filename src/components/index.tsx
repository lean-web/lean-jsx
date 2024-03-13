/* eslint-disable @typescript-eslint/no-namespace */
import { SXLGlobalContext } from "lean-jsx-types/lib/context";
export { withClientData } from "lean-web-utils/lib/server";
export { APIComponent } from "./api-component";
export { Lazy } from "./lazy-component";
export { Component } from "./class-component";
export { type DynamicController } from "./dynamic-controller";

/**
 * Convert the contents of the global context into a valid URL.
 * @param url - the base URL to append the global context.
 * @param globalContext - the global context
 * @returns
 */
export function toQueryString<G extends SXLGlobalContext = SXLGlobalContext>(
  baseUrl: string,
  globalContext?: G,
): string {
  if (!globalContext) {
    return baseUrl;
  }
  if (baseUrl.includes("?")) {
    throw new Error("The base URL should not contain any query parameters");
  }
  return (
    baseUrl +
    "?" +
    Object.entries(globalContext)
      .filter(([key, value]) => !!key && !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join("&")
  );
}

declare global {
  namespace JSX {
    // we override the IntinsicElements interface to include the web component dynamic-component
    interface IntrinsicElements extends SXL.IntrinsicElements {
      "dynamic-component": Partial<HTMLElement>;
    }
  }
}
