/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { IWebHandler } from "lean-jsx-types/events";
import { isStaticNode } from "./jsx-utils";
import type { SXLGlobalContext } from "lean-jsx-types/context";

type AllIntrinsic = SXL.IntrinsicElements[keyof SXL.IntrinsicElements];

type IntrinsicProps = {
  [K2 in keyof AllIntrinsic]-?: NonNullable<AllIntrinsic[K2]> extends (
    ...args: any[]
  ) => any
    ? never
    : NonNullable<AllIntrinsic[K2]> extends IWebHandler<Event, any>
    ? never
    : K2;
}[keyof AllIntrinsic];

// Extract the type of "style" as defined in intrinsice elements
type StyleProp = NonNullable<SXL.IntrinsicElements["div"]["style"]>;

const jsxToHtmlMap = {
  className: "class",
  htmlFor: "for",
  tabIndex: "tabindex",
  allowFullScreen: "allowfullscreen",
  autoFocus: "autofocus",
  autoPlay: "autoplay",
  capture: "capture",
  cellPadding: "cellpadding",
  cellSpacing: "cellspacing",
  charSet: "charset",
  contentEditable: "contenteditable",
  contextMenu: "contextmenu",
  controlsList: "controlslist",
  crossOrigin: "crossorigin",
  dateTime: "datetime",
  encType: "enctype",
  formAction: "formaction",
  formEncType: "formenctype",
  formMethod: "formmethod",
  formNoValidate: "formnovalidate",
  formTarget: "formtarget",
  frameBorder: "frameborder",
  inputMode: "inputmode",
  isMap: "ismap",
  itemID: "itemid",
  itemProp: "itemprop",
  itemRef: "itemref",
  itemScope: "itemscope",
  itemType: "itemtype",
  maxLength: "maxlength",
  minLength: "minlength",
  noValidate: "novalidate",
  radioGroup: "radiogroup",
  readOnly: "readonly",
  rowSpan: "rowspan",
  spellCheck: "spellcheck",
  srcDoc: "srcdoc",
  srcLang: "srclang",
  srcSet: "srcset",
  useMap: "usemap",
  strokeWidth: "stroke-width",
  strokeDasharray: "stroke-dasharray",
};

const jsxToHtmlAriaMap = {
  ariaActiveDescendant: "aria-activedescendant",
  ariaAtomic: "aria-atomic",
  ariaAutoComplete: "aria-autocomplete",
  ariaBusy: "aria-busy",
  ariaChecked: "aria-checked",
  ariaColCount: "aria-colcount",
  ariaColIndex: "aria-colindex",
  ariaColSpan: "aria-colspan",
  ariaControls: "aria-controls",
  ariaCurrent: "aria-current",
  ariaDescribedBy: "aria-describedby",
  ariaDetails: "aria-details",
  ariaDisabled: "aria-disabled",
  ariaErrorMessage: "aria-errormessage",
  ariaExpanded: "aria-expanded",
  ariaFlowTo: "aria-flowto",
  ariaHasPopup: "aria-haspopup",
  ariaHidden: "aria-hidden",
  ariaInvalid: "aria-invalid",
  ariaKeyShortcuts: "aria-keyshortcuts",
  ariaLabel: "aria-label",
  ariaLabelledBy: "aria-labelledby",
  ariaLevel: "aria-level",
  ariaLive: "aria-live",
  ariaModal: "aria-modal",
  ariaMultiLine: "aria-multiline",
  ariaMultiSelectable: "aria-multiselectable",
  ariaOrientation: "aria-orientation",
  ariaOwns: "aria-owns",
  ariaPlaceholder: "aria-placeholder",
  ariaPosInSet: "aria-posinset",
  ariaPressed: "aria-pressed",
  ariaReadOnly: "aria-readonly",
  ariaRelevant: "aria-relevant",
  ariaRequired: "aria-required",
  ariaRoleDescription: "aria-roledescription",
  ariaRowCount: "aria-rowcount",
  ariaRowIndex: "aria-rowindex",
  ariaRowSpan: "aria-rowspan",
  ariaSelected: "aria-selected",
  ariaSetSize: "aria-setsize",
  ariaSort: "aria-sort",
  ariaValueMax: "aria-valuemax",
  ariaValueMin: "aria-valuemin",
  ariaValueNow: "aria-valuenow",
  ariaValueText: "aria-valuetext",
};

// Create a union of all the prop types we support
// this helps us validate we offer good mappings for all props
export const jsxToHtmlPropMap: Record<
  IntrinsicProps & keyof typeof jsxToHtmlMap & keyof typeof jsxToHtmlAriaMap,
  string
> = {
  ...jsxToHtmlAriaMap,
  ...jsxToHtmlMap,
};

function camelToDashed(str: string): string {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
}

function normalizeProKey(key: string) {
  return jsxToHtmlPropMap[key] ?? key;
}

function normalizePropValue(value: string | number | null) {
  if (value === null) {
    return "";
  }
  return typeof value === "number" ? value : `"${value}"`;
}

function styleDeclarationToString(styles: StyleProp): string {
  let styleString = "";
  const entries = Object.entries(styles);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (value === undefined) {
      continue;
    }
    const dashedProperty = camelToDashed(key);
    styleString += `${dashedProperty}: ${value}; `;
  }
  return styleString.trim();
}

function isCSSDeclaration(
  propKey: string,
  propValue: unknown,
): propValue is StyleProp {
  return /style/.test(propKey) && typeof propValue === "object";
}

function isDataset(
  propKey: string,
  propValue: unknown,
): propValue is DOMStringMap {
  return /dataset/.test(propKey) && typeof propValue === "object";
}

function isEventHandler(
  propKey: string,
  propValue: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
): propValue is (...args: any[]) => any | IWebHandler<UIEvent, any> {
  // TODO: Maybe actually validate for IWebHandler
  return /^on.+?/.test(propKey) || typeof propValue === "function";
}

function isLeanJSXNonStringAttribute(
  propKey: string,
  _propValue: unknown,
): _propValue is SXLGlobalContext | SXL.StaticElement | SXL.StaticElement[] {
  return /(children|globalContext)/.test(propKey);
}

function flatten(props: SXL.Props): [string, string | number | undefined][] {
  if (Array.isArray(props)) {
    return props;
  }
  return Object.entries(props).flatMap(
    ([key, value]): [string, string | number | undefined][] => {
      if (!value) {
        return [];
      }
      if (isLeanJSXNonStringAttribute(key, value)) {
        return [];
      }
      if (isEventHandler(key, value)) {
        return [];
      }
      if (typeof value === "boolean") {
        return [[key, String(value)]];
      }

      if (isCSSDeclaration(key, value)) {
        return [[key, styleDeclarationToString(value)]];
      }

      if (isDataset(key, value)) {
        // TODO
        return Object.entries(value).map(([dk, dv]) => [
          /^data-/.test(dk) ? dk : `data-${dk}`,
          dv,
        ]) as [[string, string | number]];
      }

      if (/defaultValue/.test(key)) {
        return [["value", value]];
      }

      if (/^data-/.test(key)) {
        return value ? [[key, value]] : [[key, undefined]];
      }

      if (typeof value === "object") {
        return [[key, JSON.stringify(value).replace(/"/g, "'")]];
      }

      if (typeof value !== "string" && typeof value !== "number") {
        throw new Error(
          `Not implemented: Handing property ${key} with value ${JSON.stringify(
            value,
          )}`,
        );
      }
      return [[key, value]];
    },
  );
}

export type OpenAndCloseTags = [string, string];

export class JSXToHTMLUtils {
  static jsxNodeToHTMLTag(jsx: SXL.StaticElement): OpenAndCloseTags {
    if (!isStaticNode(jsx)) {
      throw new Error(
        "Cannot handle JSX nodes with function or class types." +
          "Please construct the node before calling this method. Component: " +
          JSON.stringify(jsx),
      );
    }

    const args = flatten(jsx.props)
      .map(([key, value]) => {
        try {
          if (value === undefined) {
            return normalizeProKey(key);
          }
          return `${normalizeProKey(key)}=${normalizePropValue(value)}`;
        } catch (err) {
          console.error(err, key, value);
        }
      })
      .join(" ");

    return [
      args.length > 0 ? `<${jsx.type} ${args}>` : `<${jsx.type}>`,
      `</${jsx.type}>`,
    ];
  }
}
