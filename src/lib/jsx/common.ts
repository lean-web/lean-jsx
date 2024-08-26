import type { RawProps, FunctionChildrenProps } from "./jsx-runtime";

function jsEscape(str) {
  return String(str).replace(/[^\w. ]/gi, function (c) {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

function formatChild(el: Function | Date | SXL.Child) {
  if (el instanceof Date) {
    return el.toISOString();
  }
  if (typeof el === "function") {
    return functionToString(el);
  }
  if (typeof el === "number") {
    return `${el}`;
  }
  return el;
}

function formatChildren(children: SXL.Children) {
  if (!Array.isArray(children)) {
    return [formatChild(children)];
  }

  return children
    .filter((el) => el !== null && el !== undefined)
    .map(formatChild);
}

function hasFunctionChildren(props: RawProps): props is FunctionChildrenProps {
  return (
    typeof props.children === "function" ||
    (Array.isArray(props.children) &&
      props.children.length > 0 &&
      typeof props.children[0] === "function")
  );
}

function functionToString(fn: Function | Function[]): string {
  const entire = fn.toString();
  return entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
}

export function jsxElement(
  type: string | SXL.NodeFactory<SXL.Props>,
  props: SXL.Props,
): SXL.StaticElement {
  //   if (hasFunctionChildren(props)) {
  //     const { children, ...restProps } = props;
  //     return jsxElement(type, {
  //       children: [functionToString(children)],
  //       ...restProps,
  //     });
  //   }

  props.dataset = props.dataset ?? {};

  const { children, ...others } = { children: [], ...props };

  return {
    type,
    props: others,
    children: formatChildren(children),
    componentType: getComponentType(type),
  };
}

function getComponentType(
  type: string | SXL.NodeFactory<SXL.Props>,
): SXL.ComponentType {
  if (typeof type === "string") {
    return "string";
  }
  if (
    typeof type === "function" &&
    !!type.prototype &&
    "next" in type.prototype
  ) {
    return "async-gen";
  }

  if (
    typeof type === "function" &&
    /^class\s/.test(Function.prototype.toString.call(type))
  ) {
    return "class";
  }

  return "function";
}

export function jsxFragment(props: SXL.Props): SXL.StaticElement {
  const { children } = { children: [], ...props };

  return {
    type: "fragment",
    props,
    children: formatChildren(children),
    componentType: "string",
  };
}
