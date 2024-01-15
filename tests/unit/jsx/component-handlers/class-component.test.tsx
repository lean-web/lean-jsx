import { Component } from "@/components";
import {
  ClassElementHandler,
  ClassElementTest,
} from "@/jsx/component-handlers/impl/class-component";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("class-component.test", () => {
  const { contextManager } = setupTests();

  test("ClassElementTest can handle class components", () => {
    class MyComponent extends Component {
      render(): SXL.StaticElement | SXL.AsyncElement {
        return <div>Hello world</div>;
      }
    }
    const canHandle = ClassElementTest(<MyComponent />);
    expect(canHandle).toBeTruthy();
  });

  test("ClassElementTest does not handle function components", () => {
    function MyComponent() {
      return <p data-hello="123">Hello</p>;
    }
    const canHandle = ClassElementTest(<MyComponent />);
    expect(canHandle).toBeFalsy();
  });

  test("ClassElementTest does not handle static elements", () => {
    const canHandle = ClassElementTest(<div>Hello</div>);
    expect(canHandle).toBeFalsy();
  });

  test("ClassElementHandler works as expected for class component", () => {
    class MyComponent extends Component {
      render(): SXL.StaticElement | SXL.AsyncElement {
        return <div>Hello world</div>;
      }
    }
    const handled = ClassElementHandler(<MyComponent />, contextManager({}), {
      sync: false,
    });
    expect(handled?.id).toBeTruthy();
    expect(handled?.loading).toMatchInlineSnapshot(`undefined`);
    expect(handled?.element).toMatchInlineSnapshot(`
      {
        "children": [
          "Hello world",
        ],
        "props": {
          "dataset": {},
        },
        "type": "div",
      }
    `);
  });

  test.only("ClassElementHandler works as expected for class component with props", () => {
    class MyComponent extends Component<{ foo: string }> {
      render(): SXL.StaticElement | SXL.AsyncElement {
        return <div>Hello world</div>;
      }
    }
    const handled = ClassElementHandler(
      <MyComponent foo="bar" />,
      contextManager({}),
      { sync: false }
    );
    expect(handled?.id).toBeTruthy();
    expect(handled?.loading).toMatchInlineSnapshot(`undefined`);
    expect(handled?.element).toMatchInlineSnapshot(`
      {
        "children": [
          "Hello world",
        ],
        "componentType": "string",
        "props": {
          "dataset": {},
        },
        "type": "div",
      }
    `);
  });

  test("ClassElementHandler works as expected for class component with loading state", async () => {
    class MyComponent extends Component {
      onLoading?() {
        return <>Loading..</>;
      }

      async render(): SXL.AsyncElement {
        await Promise.resolve();
        return <div>Hello world</div>;
      }
    }
    const handled = ClassElementHandler(<MyComponent />, contextManager({}), {
      sync: false,
    });
    expect(handled?.id).toBeTruthy();
    expect(handled?.loading).toMatchInlineSnapshot(`
      {
        "children": [
          "Loading..",
        ],
        "props": {
          "dataset": {
            "data-placeholder": "element-0",
          },
        },
        "type": "div",
      }
    `);
    await expect(handled?.element).resolves.toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              "Hello world",
            ],
            "props": {
              "dataset": {},
            },
            "type": "div",
          },
        ],
        "props": {
          "id": "element-0",
        },
        "type": "template",
      }
    `);
  });
});
