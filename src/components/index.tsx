/* eslint-disable @typescript-eslint/no-namespace */
import { isAsyncGen } from "@/jsx/html/jsx-utils";
import { SXLGlobalContext } from "lean-jsx-types/lib/context";
import { registerDynamicController } from "./component-registry";
import { Request } from "express";
export { withClientData } from "lean-web-utils/lib/server";
export { APIComponent } from "./api-component";

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

/**
 * The properties passed to {@link Lazy}.
 */
interface ComponentArgs extends SXL.Props {
  /**
   * A JSX component to render as a placeholder while the <Lazy>
   * main children is resolved.
   */
  loading: SXL.Element;
}

function isPromise(jsx: SXL.Element | undefined): jsx is SXL.AsyncElement {
  return !!jsx && "then" in jsx;
}

export abstract class Component<Props extends object = object>
  implements SXL.ClassComponent<Props & SXL.Props>
{
  props: Props & SXL.Props;
  constructor(props: Props & SXL.Props) {
    this.props = props;
  }
  abstract render(): SXL.StaticElement | SXL.AsyncElement;
}

/**
 * A utility JSX component that allows async JSX components to display
 * loading state as a placeholder.
 */
export class Lazy extends Component<ComponentArgs> {
  onLoading(): SXL.StaticElement {
    const props = this.props;
    if (isPromise(props.loading)) {
      return <></>;
    }
    if (isAsyncGen(props.loading)) {
      return <></>;
    }
    return props.loading;
  }

  async render(): SXL.AsyncElement {
    const props = this.props;
    if (!props.children) {
      throw new Error(
        "There is no child in Lazy to render. This is probably a mistake. If not, please file a bug.",
      );
    }
    const allResolved = await Promise.all(props.children);
    return <>{allResolved}</>;
  }
}

interface PendingResolve {
  isPending: true;
  isResolved: false;
  isError: false;
  value: null;
}

interface ResolvedPromise<T> {
  isPending: false;
  isResolved: true;
  isError: false;
  value: T;
}

/**
 * A wrapper around {@link Promise}, which exposes its state:
 * - isPending: The promise has not been resolved yet
 * - isResolved: The promise is fulfilled
 * - isError: The promise completed with an error
 * - value: The underlying value for a fulfilled promise.
 */
export type TrackedPromise<T> = PendingResolve | ResolvedPromise<T>;

/**
 * Provides methods to render a dynamically-loaded component
 * (one that doesn't block the main document loading).
 *
 * This object is meant to be created by the factory method {@link GetDynamicComponent},
 * as it relies on a very specific implementation.
 */
export interface DynamicController<
  GContext extends SXLGlobalContext = SXLGlobalContext,
  Props extends SXL.Props<object, GContext> = SXL.Props<object, GContext>,
> {
  contentId: string;
  /**
   * Render the component's loading state.
   * @param props - the component's properties {@link SXL.Props}
   * @returns - a JSX component
   */
  Render?: (props: Props) => SXL.Element;
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
  requestHandler?: (request: Request) => Record<string, unknown>;

  cache?: string;
}

/**
 * Creates a {@link DynamicController} wrapper for a dynamic component.
 *
 * Dynamic Components don't block the DOM, and they are similar to traditional React components.
 * The difference is that no state is tracked in the client, and the whole component is replaced
 * when the promise returned by a fetcher is fulfilled.
 *
 * @param contentId - A unique name for the component (e.g. "product-list")
 * @param fetcher - A function that returns a Promise.
 * @param render - A function that will receive the promise returned by the fetcher,
 *  and can return different JSX content depending on the promise state.
 * @returns A {@link DynamicController}
 */
export function GetDynamicComponent<
  T,
  GContext extends SXLGlobalContext = SXLGlobalContext,
  Props extends SXL.Props<object, GContext> = SXL.Props<object, GContext>,
>(
  contentId: string,
  fetcher: (props: Props) => Promise<T>,
  render: (
    data: TrackedPromise<T>,
    props: Props,
  ) => SXL.StaticElement | SXL.AsyncElement,
  queryParams?: (request: Request) => Record<string, string | number | boolean>,
): DynamicController<GContext, Props> {
  return registerDynamicController({
    Render: (props: Props) => (
      <dynamic-component
        data-id={toQueryString(contentId, props.globalContext)}
      >
        {render(
          {
            isPending: true,
            isError: false,
            isResolved: false,
            value: null,
          },
          props,
        )}
      </dynamic-component>
    ),
    Api: async (props: Props) => {
      const data = await fetcher(props);
      return render(
        {
          isPending: false,
          isError: false,
          isResolved: true,
          value: data,
        },
        props,
      );
    },
    contentId,
    requestHandler: queryParams,
  });
}

/**
 * A class decorator to auto register a dynamic component to the LeanJSX middleware
 * @param constructor: The class component extending {@link DynamicComponent}
 * @returns a decorated class
 */
export function Register<
  T extends DCConstructor<unknown, SXLGlobalContext, SXL.Props>,
>(constructor: T, _arg?: unknown): T {
  const ddc = new constructor({} as SXL.Props);
  registerDynamicController({
    Render: () => (
      <dynamic-component
        data-id={toQueryString(
          constructor.componentID,
          ddc.props.globalContext,
        )}
      >
        {ddc.dynamicRender(
          {
            isPending: true,
            isError: false,
            isResolved: false,
            value: null,
          },
          ddc.props,
        )}
      </dynamic-component>
    ),
    Api: async (props: SXL.Props) => {
      const ddc = new constructor(props);
      const data = await ddc.fetcher(props);
      return ddc.dynamicRender(
        {
          isPending: false,
          isError: false,
          isResolved: true,
          value: data,
        },
        props,
      );
    },
    contentId: ddc.componentID,
    requestHandler: ddc.queryParams.bind(ddc),
  });

  constructor.componentID = ddc.componentID;
  return constructor;
}

interface DCConstructor<
  T,
  GContext extends SXLGlobalContext = SXLGlobalContext,
  Props extends SXL.Props<object, GContext> = SXL.Props<object, GContext>,
> {
  new (props: Props): DynamicComponent<T, GContext, Props>;
  componentID: string;
}

/**
 * The base class for dynamic components.
 */
export abstract class DynamicComponent<
  T,
  GContext extends SXLGlobalContext = SXLGlobalContext,
  Props extends SXL.Props<object, GContext> = SXL.Props<object, GContext>,
> implements SXL.ClassComponent<SXL.Props<object, GContext>>
{
  props: Props;
  constructor(props: Props) {
    this.props = props;
  }

  /**
   * A string identifier for this component. It must be unique within a single application.
   */
  abstract componentID: string;
  declare static componentID: string;

  /**
   * A function to define the asynchronous data that this component depends on.
   * @param props - the props passed to the component, along with the global context, which will
   * contain the query parameters defined by the component.
   */
  abstract fetcher(props: Props): Promise<T>;

  /**
   * The main render function.
   * @param data - A {@link TrackedPromise} containing the data returned by the fetcher.
   * @param props - the props passed to the component, along with the global context, which will
   * contain the query parameters defined by the component.
   */
  abstract dynamicRender(
    data: TrackedPromise<T>,
    props: Props,
  ): SXL.StaticElement | SXL.AsyncElement;

  /**
   * A function to parse query parameters from the request. These query params are specific for this component.
   * @param _request
   * @returns An object containing the parsed query parameters.
   */
  queryParams(_request: Request) {
    return {};
  }

  /**
   * The actual rendering function. This calls dynamicRender under the hood.
   * @param props the props passed to the component
   * @returns the components JSX content
   */
  render() {
    const props = this.props;
    return (
      <dynamic-component
        data-id={toQueryString(this.componentID, props.globalContext)}
      >
        {this.dynamicRender(
          {
            isPending: true,
            isError: false,
            isResolved: false,
            value: null,
          },
          props,
        )}
      </dynamic-component>
    );
  }
}

declare global {
  namespace JSX {
    // we override the IntinsicElements interface to include the web component dynamic-component
    interface IntrinsicElements extends SXL.IntrinsicElements {
      "dynamic-component": Partial<HTMLElement>;
    }
  }
}
