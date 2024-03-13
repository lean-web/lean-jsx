import { isAsyncGen } from "@/jsx/html/jsx-utils";
import { isPromise } from "util/types";
import { Component } from "./class-component";

/**
 * The properties passed to {@link Lazy}.
 */
export interface ComponentArgs extends SXL.Props {
  /**
   * A JSX component to render as a placeholder while the <Lazy>
   * main children is resolved.
   */
  loading: SXL.Element;
}

/**
 * A utility JSX component that allows async JSX components to display
 * loading state as a placeholder.
 */
export class Lazy extends Component<ComponentArgs> {
  onLoading(): SXL.StaticElement {
    const props = this.props;
    if (isPromise(props.loading)) {
      return <></>;
    }
    if (isAsyncGen(props.loading)) {
      return <></>;
    }
    return props.loading;
  }

  async render(): SXL.AsyncElement {
    const props = this.props;
    if (!props.children) {
      throw new Error(
        "There is no child in Lazy to render. This is probably a mistake. If not, please file a bug.",
      );
    }
    const allResolved = await Promise.all(props.children);
    return <>{allResolved}</>;
  }
}
