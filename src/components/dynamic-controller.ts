import { SXLGlobalContext } from "lean-jsx-types/lib/context";
import { Request } from "express";

/**
 * Provides methods to render a dynamically-loaded component
 * (one that doesn't block the main document loading).
 *
 * This object is meant to be created by the factory method {@link APIComponent},
 * as it relies on a very specific implementation.
 */
export interface DynamicController<
  GContext extends SXLGlobalContext = SXLGlobalContext,
  Props extends SXL.Props<object, GContext> = SXL.Props<object, GContext>,
> {
  contentId: string;

  /**
   * Renders the component's loaded state.
   * @param props - the component's properties {@link SXL.Props}
   * @returns - a JSX component
   */
  Api: (
    props: Props,
  ) => SXL.AsyncElement | SXL.StaticElement | SXL.AsyncGenElement;

  /**
   * The parameters associated to this component
   */
  requestHandler?: (
    request: Request,
  ) => Record<string, unknown> | Promise<Record<string, unknown>>;

  cache?: string;
}
