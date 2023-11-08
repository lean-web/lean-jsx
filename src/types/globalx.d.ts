// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-namespace */
// import { SXLGlobalContext } from "./context";

// interface WebActions {
//   refetchElement: (
//     id: string,
//     queryParams: Record<string, string | number | boolean>
//   ) => void;
// }

// interface WebContext<Data> {
//   data: Data;
//   actions: WebActions;
// }

// /**
//  * A web handler.
//  *
//  * This is the type we expect for event handlers (e.g. onclick).
//  */
// export interface IWebHandler<EventType, WebData> {
//   handler: (ev?: EventType, webContext?: WebContext<WebData>) => unknown;
//   data: WebData;
// }

// /**
//  * Mapped types for converting HTMLElement default event handler function types
//  * into the event handlers expected by LeanJSX
//  */
// type EventHandler<T, WebContext> = T extends (
//   this: GlobalEventHandlers,
//   ev: infer E
// ) => unknown
//   ? IWebHandler<E, WebContext> | T
//   : T;

// // We exclude properties that are actual
// // JavaScript methods for HTMLElement:
// type SkippedProps =
//   | "click"
//   | "attachInternals"
//   | "hidePopover"
//   | "showPopover"
//   | "togglePopover"
//   | "addEventListener"
//   | "removeEventListener";

// /**
//  * A utility type for shaping {@link HTMLElement} properties in the way
//  * LeanJSX expects.
//  */
// type HTMLAttributes<T extends HTMLElement> = {
//   [K in keyof T]?: K extends SkippedProps
//     ? never
//     : K extends "children"
//     ? SXL.Children
//     : T[K] extends object
//     ? Partial<T[K]>
//     : EventHandler<T[K], any>;
// };

// interface CustomEventMap {
//   lean: CustomEvent<{
//     id: string;
//     queryParams: Record<string, string | number | boolean>;
//   }>;
// }

// /**
//  * Global namespace
//  */
// declare global {
//   interface LeanJSXDocument extends Document {
//     //adds definition to Document, but you can do the same with HTMLElement
//     addEventListener<K extends keyof CustomEventMap>(
//       type: K,
//       listener: (
//         this: Document,
//         ev: CustomEventMap[K]
//       ) => boolean | Promise<void>,
//       options?: boolean | AddEventListenerOptions
//     ): void;
//     dispatchEvent<K extends keyof CustomEventMap>(
//       ev: CustomEventMap[K]
//     ): boolean;

//     removeEventListener<K extends keyof CustomEventMap>(
//       type: K,
//       listener: (
//         this: Document,
//         ev: CustomEventMap[K]
//       ) => boolean | Promise<void>,
//       options?: boolean | EventListenerOptions
//     ): void;
//   }
//   /**
//    * The namespaces for all JSX components.
//    *
//    * By default, TypeScript will asume that these types are provided by React.
//    *
//    * However, we are providing our own implementation here, so we need to expose these
//    * types to the global interface for all common tooling (like IDEs) to work as they would
//    * with a React project.
//    */
//   export namespace SXL {
//     export type WebHandler<EventType extends Event, WebContext> = IWebHandler<
//       EventType,
//       WebContext
//     >;
//     /**
//      * Represents a set of data create for each JSX component.
//      */
//     export type Context<Ctx extends Record<string, unknown>> = Ctx;

//     /**
//      * The children elements of a JSX component.
//      */
//     export type Children = Array<string | number | boolean | StaticElement>;

//     /**
//      * The base properties that a JSX component can receive.
//      */
//     export interface Props<G = SXLGlobalContext>
//       extends Omit<HTMLAttributes<HTMLElement>, "children"> {
//       children?: Children;
//       dataset?: DOMStringMap;
//       globalContext?: G;
//     }

//     /**
//      * An override of {@link SXL.Props} that allows us to set a custom type for {@link SXLGlobalContext}.
//      * This is mostly used during testing.
//      */
//     export interface ComponentProps<G extends SXLGlobalContext>
//       extends Omit<Props, "globalContext"> {
//       globalContext?: G;
//     }

//     export type AsyncGenElement = AsyncGenerator<
//       SXL.StaticElement,
//       SXL.StaticElement,
//       never
//     >;

//     /**
//      * A function that returns a JSX node (usually "jsxDEV" or "jsx")
//      */
//     export type NodeFactory<P extends SXL.Props> = (
//       args: P
//     ) => StaticElement | AsyncElement | AsyncGenElement;

//     /**
//      * The types for a Class Component.
//      */
//     export interface ClassComponent<P extends SXL.Props> {
//       props: P;
//       /**
//        * Render a temporary placeholder that will be replaced by the
//        * return value of "renderLazy"
//        */
//       onLoading?(): StaticElement;
//       /**
//        * Render a JSX component.
//        */
//       render(): StaticElement | AsyncElement;
//     }

//     /**
//      * A reference to the {@link ClassComponent} constructor.
//      */
//     export interface ClassFactory<P extends SXL.Props> {
//       new (props: P): ClassComponent<SXL.Props>;
//     }

//     export type AsyncGenFactory = <P>(props: P & SXL.Props) => AsyncGenElement;

//     export type IntrinsicElement = {
//       type: string;
//       props: Props;
//       children: Children;
//       isDynamic?: boolean;
//       ctx?: Context<Record<string, unknown>>;
//       refs?: unknown[];
//     };

//     /**
//      * A narrowed-down type of {@link SXL.StaticElement}.
//      * Used for class components.
//      */
//     export type ClassElement = {
//       type: ClassFactory<SXL.Props>;
//       props: Props;
//       children: Children;
//       isDynamic?: boolean;
//       ctx?: Context<Record<string, unknown>>;
//       refs?: unknown[];
//     };

//     /**
//      * A narrowed-down type of {@link SXL.StaticElement}.
//      * Used for function components.
//      */
//     export type FunctionElement = {
//       type: (props: SXL.Props) => StaticElement | AsyncElement;
//       props: Props;
//       children: Children;
//       isDynamic?: boolean;
//       ctx?: Context<Record<string, unknown>>;
//       refs?: unknown[];
//     };

//     export type FunctionAsyncGenElement = {
//       type: (args: SXL.Props) => AsyncGenElement;
//       props: Props;
//       children: Children;
//       isDynamic?: boolean;
//       ctx?: Context<Record<string, unknown>>;
//       refs?: unknown[];
//     };

//     /**
//      * The union of the types of supported components.
//      * This is used to narrow elements of type {@link SXL.Element} into
//      * specific component types.
//      */
//     export type ComponentElementUnion =
//       | IntrinsicElement
//       | FunctionElement
//       | ClassElement
//       | FunctionAsyncGenElement;

//     /**
//      * The properties of a JSX component.
//      */
//     export type StaticElement = {
//       type:
//         | string
//         | NodeFactory<SXL.Props>
//         | ClassFactory<SXL.Props>
//         | ((args: SXL.Props) => AsyncGenElement);
//       props: Props;
//       children: Children;
//       isDynamic?: boolean;
//       ctx?: Context<Record<string, unknown>>;
//       refs?: unknown[];
//     };

//     /**
//      * An async component.
//      */
//     export type AsyncElement = Promise<StaticElement>;

//     /**
//      * Base type for a JSX element.
//      * A JSX component can returned by a regular, syncronous function as {@link SXL.StaticElement}
//      * of by an async function (an async component) as {@link SXL.AsyncElement}
//      */
//     export type Element = StaticElement | AsyncElement | AsyncGenElement;

//     interface IntrinsicElements {
//       a: HTMLAttributes<HTMLAnchorElement>;
//       abbr: HTMLAttributes<HTMLElement>;
//       address: HTMLAttributes<HTMLElement>;
//       area: HTMLAttributes<HTMLAreaElement>;
//       article: HTMLAttributes<HTMLElement>;
//       aside: HTMLAttributes<HTMLElement>;
//       audio: HTMLAttributes<HTMLAudioElement>;
//       b: HTMLAttributes<HTMLElement>;
//       base: HTMLAttributes<HTMLBaseElement>;
//       bdi: HTMLAttributes<HTMLElement>;
//       bdo: HTMLAttributes<HTMLElement>;
//       big: HTMLAttributes<HTMLElement>;
//       blockquote: HTMLAttributes<HTMLQuoteElement>;
//       body: HTMLAttributes<HTMLBodyElement>;
//       br: HTMLAttributes<HTMLBRElement>;
//       button: HTMLAttributes<HTMLButtonElement>;
//       canvas: HTMLAttributes<HTMLCanvasElement>;
//       caption: HTMLAttributes<HTMLElement>;
//       center: HTMLAttributes<HTMLElement>;
//       cite: HTMLAttributes<HTMLElement>;
//       code: HTMLAttributes<HTMLElement>;
//       col: HTMLAttributes<HTMLTableColElement>;
//       colgroup: HTMLAttributes<HTMLTableColElement>;
//       data: HTMLAttributes<HTMLDataElement>;
//       datalist: HTMLAttributes<HTMLDataListElement>;
//       dd: HTMLAttributes<HTMLElement>;
//       del: HTMLAttributes<HTMLModElement>;
//       details: HTMLAttributes<HTMLDetailsElement>;
//       dfn: HTMLAttributes<HTMLElement>;
//       dialog: HTMLAttributes<HTMLDialogElement>;
//       div: HTMLAttributes<HTMLDivElement>;
//       dl: HTMLAttributes<HTMLDListElement>;
//       dt: HTMLAttributes<HTMLElement>;
//       em: HTMLAttributes<HTMLElement>;
//       embed: HTMLAttributes<HTMLEmbedElement>;
//       fieldset: HTMLAttributes<HTMLFieldSetElement>;
//       figcaption: HTMLAttributes<HTMLElement>;
//       figure: HTMLAttributes<HTMLElement>;
//       footer: HTMLAttributes<HTMLElement>;
//       form: HTMLAttributes<HTMLFormElement>;
//       h1: HTMLAttributes<HTMLHeadingElement>;
//       h2: HTMLAttributes<HTMLHeadingElement>;
//       h3: HTMLAttributes<HTMLHeadingElement>;
//       h4: HTMLAttributes<HTMLHeadingElement>;
//       h5: HTMLAttributes<HTMLHeadingElement>;
//       h6: HTMLAttributes<HTMLHeadingElement>;
//       head: HTMLAttributes<HTMLHeadElement>;
//       header: HTMLAttributes<HTMLElement>;
//       hgroup: HTMLAttributes<HTMLElement>;
//       hr: HTMLAttributes<HTMLHRElement>;
//       html: HTMLAttributes<HTMLHtmlElement>;
//       i: HTMLAttributes<HTMLElement>;
//       iframe: HTMLAttributes<HTMLIFrameElement>;
//       img: HTMLAttributes<HTMLImageElement>;
//       input: HTMLAttributes<HTMLInputElement>;
//       ins: HTMLAttributes<HTMLModElement>;
//       kbd: HTMLAttributes<HTMLElement>;
//       keygen: HTMLAttributes<HTMLElement>;
//       label: HTMLAttributes<HTMLLabelElement>;
//       legend: HTMLAttributes<HTMLLegendElement>;
//       li: HTMLAttributes<HTMLLIElement>;
//       link: HTMLAttributes<HTMLLinkElement>;
//       main: HTMLAttributes<HTMLElement>;
//       map: HTMLAttributes<HTMLMapElement>;
//       mark: HTMLAttributes<HTMLElement>;
//       menu: HTMLAttributes<HTMLElement>;
//       menuitem: HTMLAttributes<HTMLElement>;
//       meta: HTMLAttributes<HTMLMetaElement>;
//       meter: HTMLAttributes<HTMLMeterElement>;
//       nav: HTMLAttributes<HTMLElement>;
//       noindex: HTMLAttributes<HTMLElement>;
//       noscript: HTMLAttributes<HTMLElement>;
//       object: HTMLAttributes<HTMLObjectElement>;
//       ol: HTMLAttributes<HTMLOListElement>;
//       optgroup: HTMLAttributes<HTMLOptGroupElement>;
//       option: HTMLAttributes<HTMLOptionElement>;
//       output: HTMLAttributes<HTMLOutputElement>;
//       p: HTMLAttributes<HTMLParagraphElement>;
//       param: HTMLAttributes<HTMLParamElement>;
//       picture: HTMLAttributes<HTMLElement>;
//       pre: HTMLAttributes<HTMLPreElement>;
//       progress: HTMLAttributes<HTMLProgressElement>;
//       q: HTMLAttributes<HTMLQuoteElement>;
//       rp: HTMLAttributes<HTMLElement>;
//       rt: HTMLAttributes<HTMLElement>;
//       ruby: HTMLAttributes<HTMLElement>;
//       s: HTMLAttributes<HTMLElement>;
//       samp: HTMLAttributes<HTMLElement>;
//       search: HTMLAttributes<HTMLElement>;
//       slot: HTMLAttributes<HTMLSlotElement>;
//       script: HTMLAttributes<HTMLScriptElement>;
//       section: HTMLAttributes<HTMLElement>;
//       select: HTMLAttributes<HTMLSelectElement>;
//       small: HTMLAttributes<HTMLElement>;
//       source: HTMLAttributes<HTMLSourceElement>;
//       span: HTMLAttributes<HTMLSpanElement>;
//       strong: HTMLAttributes<HTMLElement>;
//       style: HTMLAttributes<HTMLStyleElement>;
//       sub: HTMLAttributes<HTMLElement>;
//       summary: HTMLAttributes<HTMLElement>;
//       sup: HTMLAttributes<HTMLElement>;
//       table: HTMLAttributes<HTMLTableElement>;
//       template: HTMLAttributes<HTMLTemplateElement>;
//       tbody: HTMLAttributes<HTMLTableSectionElement>;
//       td: HTMLAttributes<HTMLTableDataCellElement>;
//       textarea: HTMLAttributes<HTMLTextAreaElement>;
//       tfoot: HTMLAttributes<HTMLTableSectionElement>;
//       th: HTMLAttributes<HTMLTableHeaderCellElement>;
//       thead: HTMLAttributes<HTMLTableSectionElement>;
//       time: HTMLAttributes<HTMLTimeElement>;
//       title: HTMLAttributes<HTMLTitleElement>;
//       tr: HTMLAttributes<HTMLTableRowElement>;
//       track: HTMLAttributes<HTMLTrackElement>;
//       u: HTMLAttributes<HTMLElement>;
//       ul: HTMLAttributes<HTMLUListElement>;
//       var: HTMLAttributes<HTMLElement>;
//       video: HTMLAttributes<HTMLVideoElement>;
//       wbr: HTMLAttributes<HTMLElement>;
//     }
//   }

//   namespace JSX {
//     export type ElementType =
//       | keyof IntrinsicElements
//       | SXL.NodeFactory<any>
//       | SXL.AsyncGenFactory
//       | SXL.ClassFactory<any>;
//     type Element = SXL.StaticElement;

//     interface ElementAttributesProperty {
//       props;
//     }
//     interface IntrinsicElements extends SXL.IntrinsicElements {}
//   }
// }

// export {};
