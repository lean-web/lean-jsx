import { registerAPIComponent } from "./component-registry";
import type { Request } from "express";

interface APIComponentConfig<Props extends Record<string, unknown>> {
  /**
   * The ID used for the API-facing component. It must be unique.
   */
  id: string;
  /**
   * A function to parse the Express request into the component parameters.
   * @param req - The Express request
   * @returns an object containing the component's parameters. Each object attribute is mapped as a component property.
   */
  requestHandler: (req: Request) => Props | Promise<Props>;
  /*
   * The server's response "cache" header (e.g. "cache: "public, max-age=30"")
   */
  cache?: string;
}

/**
 * Utility to register an API-facing component.
 * @template Props Type for the component properties
 * @template Component The component to render
 * @returns A decorated version of the passed JSX component that can be used in other components.
 */
export class APICBuilder<
  Props extends Record<string, unknown>,
  Component extends SXL.Element,
> {
  private id: string;
  private requestHandler: (req: Request) => Props | Promise<Props>;
  private cache = "no-cache";

  constructor(id: string, handler?: (req: Request) => Props | Promise<Props>) {
    this.id = id;
    this.requestHandler =
      handler ?? ((_req: Request) => this.getDefaultProps());
  }

  private getDefaultProps(): Props | Promise<Props> {
    return {} as Props;
  }

  /**
   * Set cache configuration for requesting this API Component
   * @param cache A string value for the response header "cache". Defaults to "no-cache"
   */
  withCache(cache: string): APICBuilder<Props, Component> {
    this.cache = cache;
    return this;
  }

  /**
   * Set the component to render and return it for use.
   * @param component A component to render
   * @returns A component configured as an API Component
   */
  render(
    component: (props: Props) => Component,
  ): (props: Props) => SXL.StaticElement {
    // if (!this.requestHandler) {
    //   this.requestHandler = (_req) => this.getDefaultProps();
    // }
    registerAPIComponent<NonNullable<Props>>({
      Api: component,
      contentId: this.id,
      requestHandler: this.requestHandler,
      cache: this.cache,
    });

    return (props: Props) => (
      <div ref={this.id} data-lean-api-component>
        {component(props)}
      </div>
    );
  }
}

/**
 * Utility to register an API-facing component.
 * @template Props Type for the component properties
 * @template Component The component to render
 * @param config - The API configuration for the endpoint exposed by the component
 * @param component - A component function
 * @returns A decorated version of the passed JSX component that can be used in other components.
 */
export function APIC<
  Props extends Record<string, unknown>,
  Component extends SXL.Element,
>(
  config: APIComponentConfig<NonNullable<Props>>,
  component: (props: Props) => Component,
) {
  registerAPIComponent<NonNullable<Props>>({
    Api: component,
    contentId: config.id,
    requestHandler: config.requestHandler,
    cache: config.cache,
  });

  return (props: Props) => (
    <div ref={config.id} data-lean-api-component>
      {component(props)}
    </div>
  );
}
