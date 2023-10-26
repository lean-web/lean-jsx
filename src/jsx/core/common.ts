function formatChildren(children: SXL.Children) {
    if (!Array.isArray(children)) {
        return [children];
    }

    return children.filter(el => el);
}

export function jsxElement(
    type: string | SXL.NodeFactory<SXL.Props>,
    props: SXL.Props
): SXL.StaticElement {
    props.dataset = props.dataset ?? {};

    const { children, ...others } = { children: [], ...props };

    const node = {
        type,
        props: others,
        children: formatChildren(children)
    };
    return node;
}

export function jsxFragment(props: SXL.Props): SXL.StaticElement {
    const { children } = { children: [], ...props };

    return {
        type: "fragment",
        props,
        children: formatChildren(children)
    };
}
