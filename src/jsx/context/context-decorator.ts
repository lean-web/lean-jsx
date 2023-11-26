import { ParsedComponent } from "../component-handlers";
import { ContextID } from "./context-manager";

/**
 * A set of query selectors to use while
 * generating JS actions for the elements.
 */
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

/**
 * Create the JS required to handle inlined event listeners like "onclick".
 *
 * @param element - the element with context
 * @returns a string with JS code.
 */
export function decorateContext(element: ParsedComponent): string {
  if (element.handlers.length === 0) {
    return "";
  }
  const handlers = element.handlers
    .map(
      ([ev, h]) =>
        `sxl.addEventListener('${QuerySelectors.eventSource(
          element.id,
        )}', '${ev.replace(/^on/, "")}',${h})`,
    )
    .join(";\n");
  const fns = Object.entries(element.context)
    .filter(
      // eslint-disable-next-line @typescript-eslint/ban-types
      (entry): entry is [string, Function] => typeof entry[1] === "function",
    )
    .map(([key, fn]) => `this.${key} =  ${fn.toString()}`)
    .join("\n");

  const functionBody = `${fns}${handlers}`.trim();

  if (Object.entries(element.context).length === 0) {
    return `<script type="application/javascript">
        ${functionBody};
    </script>`;
  }

  const source = `<script type="application/javascript">
      (function(){
        ${functionBody};
      }).call(${JSON.stringify(element.context)});
    </script>`;
  return source;
}

/**
 * Create the script tag for replacing the placeholder of
 * async elements. This has to be inserted AFTER the
 * async element content, and requires the "sxl" object
 * to be in the global scope (inserted by adding lean-jsx/lib/web/sxl.js into the page)
 * @param id the context ID that connects the placeholder with the resolved
 *      content.
 * @returns a string containing the script tag.
 */
export function wirePlaceholder(id: ContextID) {
  return `<script>
    sxl.fillPlaceHolder("${id}");  
 </script>
 `;
}
