import type { Request } from "express";

/**
 * Provides methods to render a dynamically-loaded component
 * (one that doesn't block the main document loading).
 *
 * This object is meant to be created by the factory method {@link APIC},
 * as it relies on a very specific implementation.
 */
export interface DynamicController<
  Props extends SXL.Props<object> = SXL.Props<object>,
> {
  contentId: string;

  /**
   * Renders the component's loaded state.
   * @param props - the component's properties {@link SXL.Props}
   * @returns - a JSX component
   */
  Api: (props: Props) => SXL.Element;

  /**
   * The parameters associated to this component
   */
  requestHandler?: (
    request: Request,
  ) => Record<string, unknown> | Promise<Record<string, unknown>>;

  cache?: string;
}
