/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export function mergeProps(node1: SXL.StaticElement, node2: SXL.StaticElement) {
    const { children: _c1, ...props1 } = node1.props;
    const { children: _c2, ...props2 } = node1.props;
    const props = { ...props1, ...props2 };
    Object.keys(props)
        .map((k) => k as keyof SXL.Props)
        .forEach((key) => {
            if (key === "children") {
                return;
            }
            const prop1 = node1.props[key];
            const prop2 = node2.props[key];

            if (
                Array.isArray(props[key]) &&
                Array.isArray(prop1) &&
                Array.isArray(prop2)
            ) {
                // @ts-expect-error any type
                props[key] = [...prop1, ...prop2];
            } else if (typeof prop1 === "object" && typeof prop2 === "object") {
                props[key] = { ...prop1, ...prop2 };
            }
        });
    return props;
}
