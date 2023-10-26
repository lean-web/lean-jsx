import { jsxElement, jsxFragment } from "./common";

/**
 * Process JSX elements
 * @param type
 * @param props
 * @returns
 */
export function jsx(
    type: string | SXL.NodeFactory<SXL.Props>,
    props: SXL.Props
): SXL.StaticElement | Promise<SXL.StaticElement> {
    return jsxElement(type, props);
}

export function jsxs(
    type: string | SXL.NodeFactory<SXL.Props>,
    props: SXL.Props
): SXL.StaticElement | Promise<SXL.StaticElement> {
    return jsxElement(type, props);
}

export function Fragment(props: SXL.Props): SXL.StaticElement {
    return jsxFragment(props);
}
