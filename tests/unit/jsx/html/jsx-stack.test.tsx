import { Component } from "@/components";
import { webAction } from "lean-web-utils/lib/server";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("jsx-stack.test", () => {
  const { jsxStack } = setupTests();

  test("static elements", async () => {
    const stack = jsxStack({ username: "Pedro" });
    void stack.push(
      <div>
        <p>E1</p>
        <p>E2</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toBe("<div><p>E1</p><p>E2</p></div>");
  });

  test("static elements - with handlers", async () => {
    const stack = jsxStack({ username: "Pedro" });

    void stack.push(
      <div>
        <p>E1</p>
        <p>E2</p>
        <button
          onclick={webAction<MouseEvent, Record<string, unknown>>({}, () =>
            console.log("clicked")
          )}
        >
          Click
        </button>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<div><p>E1</p><p>E2</p><button data-action="element-3">Click</button><script type="application/javascript">
              sxl.addEventListener('[data-action="element-3"]', 'click',sxl.actionHandler(() => console.log("clicked"), {}));
          </script></div>"
    `);
  });

  test("function component", async () => {
    const stack = jsxStack({ username: "Pedro" });
    function E1() {
      return <p>E1</p>;
    }
    void stack.push(
      <div>
        <E1 />
        <p>E2</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toBe("<div><p>E1</p><p>E2</p></div>");
  });

  test("function component: with context", async () => {
    const stack = jsxStack({ username: "Pedro" });

    function List(
      this: { greet: string },
      { globalContext }: { globalContext?: { username: string } }
    ) {
      this.greet = "Hi"!;
      return (
        <button onclick={webAction({}, () => console.log(this.greet))}>
          Hello {globalContext?.username}
        </button>
      );
    }
    void stack.push(<List />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<button data-action="element-0">Hello Pedro</button><script type="application/javascript">
            (function(){
              sxl.addEventListener('[data-action="element-0"]', 'click',sxl.actionHandler(() => console.log(this.greet), {}));
            }).call({"greet":"Hi"});
          </script>"
    `);
  });

  test("function component: with explicit data", async () => {
    const stack = jsxStack({ username: "Pedro" });

    function List(
      this: { greet: string },
      { globalContext }: { globalContext?: { username: string } }
    ) {
      this.greet = "Hi"!;
      const someInternalData = "This is internal";
      return (
        <button
          onclick={webAction({ someInternalData }, (ev, inner) =>
            console.log(this.greet, inner?.data?.someInternalData)
          )}
        >
          Hello {globalContext?.username}
        </button>
      );
    }
    void stack.push(<List />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<button data-action="element-0">Hello Pedro</button><script type="application/javascript">
            (function(){
              sxl.addEventListener('[data-action="element-0"]', 'click',sxl.actionHandler((ev, inner) => console.log(this.greet, inner?.data?.someInternalData), {"someInternalData":"This is internal"}));
            }).call({"greet":"Hi"});
          </script>"
    `);
  });

  test("function component: nested one level", async () => {
    const stack = jsxStack({ username: "Pedro" });

    function E1() {
      return <p>E1</p>;
    }
    function List() {
      return (
        <>
          <E1 />
          <p>E2</p>
        </>
      );
    }
    void stack.push(<List />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`"<p>E1</p><p>E2</p>"`);
  });

  test("function component: nested two levels", async () => {
    const stack = jsxStack({ username: "Pedro" });

    function AnotherE1() {
      return <p>E1</p>;
    }

    function E1() {
      return <AnotherE1 />;
    }
    function List() {
      return (
        <>
          <E1 />
          <p>E2</p>
        </>
      );
    }
    void stack.push(<List />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`"<p>E1</p><p>E2</p>"`);
  });

  test("2 static and 1 async element", async () => {
    const stack = jsxStack({ username: "Pedro" });
    async function Second(): SXL.AsyncElement {
      return new Promise((resolve) => resolve(<p>E2</p>));
    }
    void stack.push(
      <div>
        <p>E1</p>
        <Second />
        <p>E3</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
            "<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p></div><template id="element-2"><p>E2</p></template><script>
                sxl.fillPlaceHolder("element-2");  
             </script>
             "
        `);
  });

  test("2 static and 1 async element - with handler", async () => {
    const stack = jsxStack({ username: "Pedro" });
    async function Second(): SXL.AsyncElement {
      return new Promise((resolve) =>
        resolve(<button onclick={webAction({}, () => "E2")}>E2</button>)
      );
    }
    void stack.push(
      <div>
        <p>E1</p>
        <Second />
        <p>E3</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p></div><template id="element-2"><button data-action="element-4">E2</button><script type="application/javascript">
              sxl.addEventListener('[data-action="element-4"]', 'click',sxl.actionHandler(() => "E2", {}));
          </script></template><script>
          sxl.fillPlaceHolder("element-2");  
       </script>
       "
    `);
  });

  test("2 static and 1 async element - sync mode", async () => {
    const stack = jsxStack({ username: "Pedro" });
    async function Second(): SXL.AsyncElement {
      return new Promise((resolve) => resolve(<p>E2</p>));
    }
    void stack.push(
      <div>
        <p>E1</p>
        <Second />
        <p>E3</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
            "<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p></div><template id="element-2"><p>E2</p></template><script>
                sxl.fillPlaceHolder("element-2");  
             </script>
             "
        `);
  });

  test("test stack events", async () => {
    const stack = jsxStack({ username: "Pedro" });
    async function Second(): SXL.AsyncElement {
      return new Promise((resolve) =>
        resolve(<button onclick={webAction({}, () => "E2")}>E2</button>)
      );
    }
    void stack.push(
      <div>
        <p>E1</p>
        <Second />
        <p>E3</p>
      </div>
    );

    const flushes: string[] = [];

    async function consume() {
      let first = await stack.pop();

      let all = "";

      stack.on("ASYNC_START", () => {
        flushes.push(all);
      });

      stack.on("ASYNC_END", () => {
        flushes.push(all);
      });

      while (first) {
        all += first;
        first = await stack.pop();
      }
    }

    await consume();

    expect(flushes).toMatchInlineSnapshot(`
      [
        "<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p>",
        "<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p></div><template id="element-2"><button data-action="element-4">E2</button><script type="application/javascript">
              sxl.addEventListener('[data-action="element-4"]', 'click',sxl.actionHandler(() => "E2", {}));
          </script></template>",
      ]
    `);
  });

  test("fragment elements", async () => {
    const stack = jsxStack({ username: "Pedro" });
    void stack.push(<>hello</>);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`"hello"`);
  });

  test("fragment elements - nested", async () => {
    const stack = jsxStack({ username: "Pedro" });
    void stack.push(
      <>
        <>hello</>
      </>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`"hello"`);
  });

  test("function component - throws error", async () => {
    const stack = jsxStack({ username: "Pedro" });
    function E1(): SXL.StaticElement {
      throw new Error("Connection failed");
    }
    void stack.push(
      <div>
        <E1 />
        <p>E2</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(
      `"<div><div data-leanjsx-error="true">An error ocurred</div><p>E2</p></div>"`
    );
  });

  test("async function component - throws error", async () => {
    const stack = jsxStack({ username: "Pedro" });
    async function E1(): SXL.AsyncElement {
      return Promise.reject("Could not render component");
    }
    void stack.push(
      <div>
        <E1 />
        <p>E2</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
            "<div><div data-placeholder="element-1"></div><p>E2</p></div><template id="element-1"><div data-leanjsx-error="true">An error ocurred</div></template><script>
                sxl.fillPlaceHolder("element-1");  
             </script>
             "
        `);
  });

  test("async gen function component", async () => {
    const stack = jsxStack({ username: "Pedro" });
    async function* E1() {
      yield <p>Loading</p>;
      await Promise.resolve();
      return <p>E1</p>;
    }
    void stack.push(
      <div>
        <E1 />
        <p>E2</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
            "<div><div data-placeholder="element-1"><p>Loading</p></div><p>E2</p></div><template id="element-1"><p>E1</p></template><script>
                sxl.fillPlaceHolder("element-1");  
             </script>
             "
        `);
  });

  test("async gen function component - error before yielding", async () => {
    const stack = jsxStack({ username: "Pedro" });
    function failingResource(): Promise<void> {
      return Promise.reject();
    }

    async function* E1() {
      throw new Error("Oh no!");
      yield <p>Loading</p>;

      await failingResource();
      return <p>E1</p>;
    }
    void stack.push(
      <div>
        <E1 />
        <p>E2</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
            "<div><div data-placeholder="element-1"><div data-leanjsx-error="true">An error ocurred</div></div><p>E2</p></div><template id="element-1"><div data-leanjsx-error="true">An error ocurred</div></template><script>
                sxl.fillPlaceHolder("element-1");  
             </script>
             "
        `);
  });

  test("async gen function component - error after yielding", async () => {
    const stack = jsxStack({ username: "Pedro" });
    function failingResource(): Promise<void> {
      return Promise.reject();
    }

    async function* E1() {
      yield <p>Loading</p>;

      await failingResource();
      return <p>E1</p>;
    }
    void stack.push(
      <div>
        <E1 />
        <p>E2</p>
      </div>
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
            "<div><div data-placeholder="element-1"><p>Loading</p></div><p>E2</p></div><template id="element-1"><div data-leanjsx-error="true">An error ocurred</div></template><script>
                sxl.fillPlaceHolder("element-1");  
             </script>
             "
        `);
  });

  test("class component", async () => {
    type Gcontext = { username: string };
    const stack = jsxStack<Gcontext>({ username: "Pedro" });
    type ClassProps = SXL.Props & { globalContext?: Gcontext };

    class MyComponent extends Component<ClassProps> {
      greet: string = "Hello";

      render() {
        const props = this.props;
        return (
          <div>
            {this.greet} {props.globalContext?.username}
          </div>
        );
      }
    }

    await stack.push(<MyComponent />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`"<div>Hello Pedro</div>"`);
  });

  test("class component - async", async () => {
    const stack = jsxStack({ username: "Pedro" });
    class MyComponent extends Component {
      onLoading() {
        return <div>Loading...</div>;
      }
      async render() {
        await Promise.resolve();
        return <div>Loaded</div>;
      }
    }

    await stack.push(<MyComponent />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<div data-placeholder="element-0"><div>Loading...</div></div><template id="element-0"><div>Loaded</div></template><script>
          sxl.fillPlaceHolder("element-0");  
       </script>
       "
    `);
  });

  test("class component with props", async () => {
    type Gcontext = { username: string };
    const stack = jsxStack<Gcontext>({ username: "Pedro" });

    interface ComponentArgs {
      greet: string;
    }

    class MyComponent extends Component<ComponentArgs> {
      render() {
        const props = this.props;
        return (
          <button onclick={webAction({}, () => console.log(props.greet))}>
            Say hi! {props.greet}
          </button>
        );
      }
    }

    await stack.push(<MyComponent greet="Friend" />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<button data-action="element-0">Say hi! Friend</button><script type="application/javascript">
            (function(){
              sxl.addEventListener('[data-action="element-0"]', 'click',sxl.actionHandler(() => console.log(props.greet), {}));
            }).call({"props":{"greet":"Friend","dataset":{},"children":[],"globalContext":{"username":"Pedro"}}});
          </script>"
    `);
  });

  test("class component with handlers", async () => {
    type Gcontext = { username: string };
    const stack = jsxStack<Gcontext>({ username: "Pedro" });

    class MyComponent extends Component {
      greet: string = "Hello";

      render() {
        return (
          <button onclick={webAction({}, () => console.log(this.greet))}>
            Say hi!
          </button>
        );
      }
    }

    await stack.push(<MyComponent />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<button data-action="element-0">Say hi!</button><script type="application/javascript">
            (function(){
              sxl.addEventListener('[data-action="element-0"]', 'click',sxl.actionHandler(() => console.log(this.greet), {}));
            }).call({"props":{"dataset":{},"children":[],"globalContext":{"username":"Pedro"}},"greet":"Hello"});
          </script>"
    `);
  });
});
