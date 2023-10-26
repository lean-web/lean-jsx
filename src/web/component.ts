// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type{ GetDynamicComponent } from "../components/lazy";

export interface DynamicDataComponent extends Partial<HTMLElement> {
    "data-id": string;
}

/**
 * A native web component for asynchronous/dynamic rendering.
 * 
 * Not meant to be used directly by developers, as it should be accessed
 * through {@link GetDynamicComponent}
 */
export class DynamicComponent extends HTMLElement
    implements DynamicDataComponent {
    "data-id": string;
    domParser: DOMParser;

    isLoading = false;

    constructor() {
        super();
        this.domParser = new DOMParser();
    }

    static get observedAttributes() {
        return ["data-id"];
    }

    connectedCallback() {
        // Prevent triggering the data fetch again
        // if it's already in progress
        if (this.isLoading) {
            return;
        }

        const dataId = this.getAttribute("data-id");
        this.isLoading = true;
        void fetch(`/components/${dataId}`)
            .then(response => response.text())
            .then(data => {
                const responseDOM = this.domParser.parseFromString(
                    data,
                    "text/html"
                );
                const fragment = responseDOM.createDocumentFragment()
                Array.from(responseDOM.body.children).forEach(child => {
                    fragment.appendChild(child)
                })
                this.replaceWith(fragment)
                // this.replaceChildren(fragment);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "data-id" && oldValue !== newValue) {
            this.connectedCallback();
        }
    }

    static register() {
        if (!customElements.get("dynamic-component")) {
            customElements.define("dynamic-component", DynamicComponent);
        }
    }
}
