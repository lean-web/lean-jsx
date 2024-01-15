function formatChildren(children: SXL.Children) {
  if (!Array.isArray(children)) {
    return [children];
  }

  return children
    .filter((el) => el)
    .map((el) => {
      if (el instanceof Date) {
        return el.toISOString();
      }
      return el;
    });
}

export function jsxElement(
  type: string | SXL.NodeFactory<SXL.Props>,
  props: SXL.Props,
): SXL.StaticElement {
  props.dataset = props.dataset ?? {};

  const { children, ...others } = { children: [], ...props };

  const node = {
    type,
    props: others,
    children: formatChildren(children),
    componentType: getComponentType(type),
  };
  return node;
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
