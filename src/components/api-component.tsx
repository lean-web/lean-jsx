import { SXLGlobalContext } from "lean-jsx-types/context";
import { registerAPIComponent } from "./component-registry";
import { Request } from "express";
export { withClientData, withClientContext } from "lean-web-utils/server";

interface APIComponentConfig<P extends Record<string, unknown>> {
  /**
   * The ID used for the API-facing component. It must be unique.
   */
  id: string;
  /**
   * A function to parse the Express request into the component parameters.
   * @param req - The Express request
   * @returns an object containing the component's parameters. Each object attribute is mapped as a component property.
   */
  requestHandler: (req: Request) => P | Promise<P>;
  /*
   * The server's response "cache" header (e.g. "cache: "public, max-age=30"")
   */
  cache?: string;
}

/**
 * Utility to register an API-facing component.
 * @param config - The API configuration for the endpoint exposed by the component
 * @param component - A component function
 * @returns A decorated version of the passed JSX component that can be used in other components.
 */
export function APIComponent<
  P extends Record<string, unknown>,
  T extends
    | SXL.AsyncElement
    | SXL.StaticElement
    | SXL.AsyncGenElement
    | SXL.ClassElement,
>(config: APIComponentConfig<NonNullable<P>>, component: (props: P) => T) {
  registerAPIComponent<SXLGlobalContext, NonNullable<P>>({
    Api: component,
    contentId: config.id,
    requestHandler: config.requestHandler,
    cache: config.cache,
  });

  return (props: P) => (
    <div ref={config.id} data-lean-api-component>
      {component(props)}
    </div>
  );
}
