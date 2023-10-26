import { jsxElement, jsxFragment } from "./common";

export function jsxDEV(
    type: string | SXL.NodeFactory<SXL.Props>,
    props: SXL.Props
): SXL.StaticElement | Promise<SXL.StaticElement> {
    return jsxElement(type, props);
}

export function Fragment(props: SXL.Props): SXL.StaticElement {
    return jsxFragment(props);
}
