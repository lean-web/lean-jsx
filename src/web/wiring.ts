import { refetchElement, update } from "lean-web-utils/lib/server";

/**
 * Finds placeholder for async components and replaces them
 * with theor fulfilled content.
 *
 * @param placeHolderId - A unique ID generated for the placeholder
 */
export function fillPlaceHolder(placeHolderId: string): void {
  const template = document.getElementById(
    placeHolderId,
  ) as HTMLTemplateElement;
  const container = document.querySelector(
    `[data-placeholder="${placeHolderId}"]`,
  );

  if (!template || !container) {
    console.debug("Could not find template or container", {
      template,
      container,
    });
    return;
  }
  const clone = document.importNode(template.content, true);

  const maybeNestedTemplate = clone.querySelector("[data-placeholder]");
  if (maybeNestedTemplate) {
    while (container.firstChild) {
      maybeNestedTemplate.appendChild(container.firstChild);
    }
  }

  container.innerHTML = "";
  container.removeAttribute(`[data-${placeHolderId}]`);
  if (container.parentElement) {
    // if we can, replace the placeholder with the actual element
    container.parentElement.replaceChild(clone, container);
  } else {
    container.appendChild(clone);
    console.log("Appended");
  }
  // clean-up the template
  template.remove();
}

/**
 * Decorates event handlers with web-specific actions and data.
 * @param h - the original event handler
 * @param data - the data to decorate
 * @returns - a DOM-compatible event handler
 */
export function actionHandler(
  h: (
    ev: Event,
    data: {
      data: unknown;
      element: Element;
      actions: { refetchElement: typeof refetchElement; update: typeof update };
    },
  ) => unknown,
  data: unknown,
): unknown {
  return function (this: Element, ev: Event) {
    h(ev, {
      data,
      element: this,
      actions: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        refetchElement,
        update,
      },
    });
  };
}

function waitForElm(selector: string): Promise<Element | null> {
  let resolved = false;
  let observer: MutationObserver | null = null;
  const TIMEOUT = 5000;
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    // add a timeout to clean the observer in case
    // the element is never added to the document
    const timeout = setTimeout(() => {
      if (resolved === false && observer) {
        observer?.disconnect();
      }
    }, TIMEOUT);

    observer = new MutationObserver((_) => {
      if (document.querySelector(selector)) {
        observer?.disconnect();
        clearTimeout(timeout);
        resolved = true;
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Helper function to add event listeners to elements.
 * If the element does not exist, it observes the document and sets the
 * event listener once the element is added.
 * @param querySelector
 * @param event
 * @param handler
 */
export function addEventListener(
  querySelector: string,
  event: string,
  handler: () => unknown,
) {
  const element = document.querySelector(querySelector);
  if (!element) {
    void waitForElm("#click1").then((elm) => {
      if (!elm) {
        console.warn(
          `Tried to attach ${event} event to element "${querySelector}", but the element does not exist.`,
        );
        return;
      }
      elm.addEventListener(event, handler);
    });
  } else {
    element.addEventListener(event, handler);
  }
}
