export type TextNode = string;
export interface StaticNode extends Omit<SXL.StaticElement, "type"> {
    type: string;
}

export interface FunctionNode extends Omit<SXL.StaticElement, "type"> {
    type: SXL.NodeFactory<SXL.Props>;
}
export interface ClassNode extends Omit<SXL.StaticElement, "type"> {
    type: SXL.ClassFactory<SXL.Props>;
}

export function isClass(
    func: string | SXL.NodeFactory<SXL.Props> | SXL.ClassFactory<SXL.Props>
): func is SXL.ClassFactory<SXL.Props> {
    return (
        typeof func === "function" &&
        /^class\s/.test(Function.prototype.toString.call(func))
    );
}

export function isTextNode(
    jsx: SXL.Element | SXL.AsyncElement | string
): jsx is TextNode {
    return typeof jsx === "string";
}

export function isFunctionNode(
    jsx: SXL.Element | SXL.Children
): jsx is FunctionNode {
    if (typeof jsx === "string" || Array.isArray(jsx)) {
        return false;
    }
    if (isPromise(jsx)) {
        return false;
    }
    if (isAsyncGen(jsx)) {
        return false;
    }
    return typeof jsx.type === "function" && !isClass(jsx.type);
}

export function isPromise(
    jsx:
        | SXL.StaticElement
        | Promise<SXL.StaticElement>
        | SXL.AsyncGenElement
        | undefined
        | string
): jsx is Promise<SXL.StaticElement> {
    return typeof jsx !== "string" && !!jsx && "then" in jsx;
}

export function isAsyncGen(
    jsx:
        | SXL.StaticElement
        | Promise<SXL.StaticElement>
        | SXL.AsyncGenElement
        | undefined
        | string
): jsx is SXL.AsyncGenElement {
    return typeof jsx !== "string" && !!jsx && "next" in jsx;
}

export function isClassNode(jsx: SXL.Element | SXL.Children): jsx is ClassNode {
    if (typeof jsx === "string" || Array.isArray(jsx)) {
        return false;
    }
    if (isPromise(jsx)) {
        return false;
    }
    if (isAsyncGen(jsx)) {
        return false;
    }
    return typeof jsx.type === "function" && isClass(jsx.type);
}

export function isArrayOfNodes(
    jsx: SXL.StaticElement | SXL.Children
): jsx is Array<SXL.StaticElement | string> {
    return Array.isArray(jsx);
}

export function isStaticNode(
    jsx: SXL.StaticElement | SXL.AsyncGenElement | SXL.AsyncElement | string
): jsx is StaticNode {
    return (
        !isAsyncGen(jsx) &&
        !isPromise(jsx) &&
        !isTextNode(jsx) &&
        !isArrayOfNodes(jsx) &&
        !isFunctionNode(jsx) &&
        !isClassNode(jsx)
    );
}

export function isFragmentNode(
    jsx: SXL.Element | undefined
): jsx is FunctionNode {
    return (
        !!jsx &&
        !isPromise(jsx) &&
        !isAsyncGen(jsx) &&
        typeof jsx.type !== "string" &&
        /^Fragment$/i.test(jsx.type.name)
    );
}

export function unwrapFragments(
    element: SXL.StaticElement | string | number | boolean
): Array<SXL.StaticElement | string> {
    if (
        typeof element === "string" ||
        typeof element === "number" ||
        typeof element === "boolean"
    ) {
        return [`${element}`];
    }
    if (element.type === "fragment") {
        const children = element.children.flatMap(child =>
            unwrapFragments(child)
        );
        return children;
    }
    if (isFragmentNode(element)) {
        const props: SXL.Props = {
            ...element.props,
            children: element.children
        };
        const newElement = element.type(props);
        if (isPromise(newElement) || isAsyncGen(newElement)) {
            throw new Error("Fragments should not return Promises");
        }
        return unwrapFragments(newElement);
    }
    return [element];
}
