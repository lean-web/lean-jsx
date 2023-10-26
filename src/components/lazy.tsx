/* eslint-disable @typescript-eslint/no-namespace */
import { isAsyncGen } from "@/jsx/html/jsx-utils";
import { SXLGlobalContext } from "lean-jsx/src/types/context";

export function toQueryString(
    url: string,
    globalContext?: SXLGlobalContext
): string {
    if (!globalContext) {
        return url;
    }
    return (
        url +
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

/**
 * A utility JSX component that allows async JSX components to display
 * loading state as a placeholder.
 */
export class Lazy implements SXL.ClassComponent<ComponentArgs> {
    props: ComponentArgs;

    constructor(props: ComponentArgs) {
        this.props = props;
    }

    async renderLazy(): SXL.AsyncElement {
        if (!this.props.children) {
            throw new Error(
                "There is no child in Lazy to render. This is probably a mistake. If not, please file a bug."
            );
        }
        const allResolved = await Promise.all(this.props.children);
        return <>{allResolved}</>;
    }

    render(): SXL.StaticElement {
        if (isPromise(this.props.loading)) {
            return <></>;
        }
        if (isAsyncGen(this.props.loading)) {
            return <></>;
        }
        return this.props.loading;
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

type TrackedPromise<T> = PendingResolve | ResolvedPromise<T>;

/**
 * Provides methods to render a dynamically-loaded component
 * (one that doesn't block the main document loading).
 *
 * This object is meant to be created by the factory method {@link GetDynamicComponent},
 * as it relies on a very specific implementation.
 */
export interface DynamicController {
    contentId: string;
    /**
     * Render the component's loading state.
     * @param props - the component's properties {@link SXL.Props}
     * @returns - a JSX component
     */
    Render: (props: SXL.Props) => SXL.Element;
    /**
     * Renders the component's loaded state.
     * @param props - the component's properties {@link SXL.Props}
     * @returns - a JSX component
     */
    Api: (props: SXL.Props) => SXL.AsyncElement;
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
export function GetDynamicComponent<T>(
    contentId: string,
    fetcher: () => Promise<T>,
    render: (data: TrackedPromise<T>) => SXL.StaticElement | SXL.AsyncElement
): DynamicController {
    return {
        Render: (props: SXL.Props) => (
            <dynamic-component
                data-id={toQueryString(contentId, props.globalContext)}
            >
                {render({
                    isPending: true,
                    isError: false,
                    isResolved: false,
                    value: null,
                    ...props
                })}
            </dynamic-component>
        ),
        Api: async (props: SXL.Props) => {
            const data = await fetcher();
            return render({
                isPending: false,
                isError: false,
                isResolved: true,
                value: data,
                ...props
            });
        },
        contentId
    };
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "dynamic-component": Partial<HTMLElement>;
        }
    }
}
