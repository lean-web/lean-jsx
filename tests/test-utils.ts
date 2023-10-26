import { Readable } from "stream";

export async function* streamProcessor(readable: Readable) {
    let buffer = "";

    for await (const chunk of readable) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        buffer += chunk.toString();

        // Check if the buffer contains "FLUSH"
        let flushIndex = buffer.indexOf("FLUSH");
        while (flushIndex !== -1) {
            yield buffer.slice(0, flushIndex);
            buffer = buffer.slice(flushIndex + 5); // +5 to skip "FLUSH"
            flushIndex = buffer.indexOf("FLUSH");
        }
    }

    yield null; // yield null at the end when the stream is finished
}

interface StaticElementOptions {
    type?: string;
    withOnClick?: boolean;
    withTextChild?: string;
    withChild?: SXL.StaticElement;
    withDataSet?: DOMStringMap;
    withProps?: SXL.Props;
}
export function withSxlStaticElement(
    opts?: StaticElementOptions
): SXL.StaticElement {
    const type = opts?.withOnClick ? opts.type ?? "button" : opts?.type ?? "p";
    const children: Array<string | SXL.StaticElement> = [];

    if (opts?.withTextChild) {
        children.push(opts.withTextChild);
    }
    if (opts?.withChild) {
        children.push(opts.withChild);
    }

    const dataset = opts?.withDataSet ?? {};
    return {
        type,
        props: {
            dataset,
            ...opts?.withProps,
        },
        children,
    };
}
