import { ContextID, SXLElementWithContext } from "./context-manager";

export class QuerySelectors {
    static template(id: ContextID): string {
        return `#${id}`;
    }
    static placeholder(id: ContextID): string {
        return `[data-placeholder="${id}"]`;
    }

    static eventSource(id: ContextID): string {
        return `[data-action="${id}"]`;
    }
}

export function decorateContext(
    element: Omit<SXLElementWithContext, "placeholder">
) {
    if (element.handlers.length === 0) {
        return "";
    }
    const handlers = element.handlers
        .map(
            ([ev, h]) =>
                `document.querySelector('${QuerySelectors.eventSource(
                    element.id
                )}').addEventListener('${ev.replace(
                    /^on/,
                    ""
                )}', ${h?.toString()})`
        )
        .join(";\n");
    const fns = Object.entries(element.context)
        .filter(
            // eslint-disable-next-line @typescript-eslint/ban-types
            (entry): entry is [string, Function] =>
                typeof entry[1] === "function"
        )
        .map(([key, fn]) => `this.${key} =  ${fn.toString()}`)
        .join("\n");

    const functionBody = `${fns}${handlers}`.trim();

    const source = `<script>
      (function(){
        ${functionBody}
      }).call(${JSON.stringify(element.context)})
    </script>`;
    return source;
}

export function wirePlaceholder(id: ContextID) {
    return `<script>
    sxl.fillPlaceHolder("${id}");  
 </script>
 `;
}
