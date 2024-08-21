import { APIC, APICBuilder, Lazy, withClientData } from "@/components";

export async function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function Slow(_props: SXL.Props) {
  await wait(100);
  return <p id="slow1">This is slow</p>;
}

async function* NewComponent(): AsyncGenerator<
  SXL.StaticElement,
  SXL.StaticElement,
  never
> {
  yield <div id="loading3">Loading from async gen</div>;

  await wait(100);

  return <div id="loaded3">Hello</div>;
}

interface Slow2I extends SXL.Props {
  loadtime: number;
}

async function Slow2({ loadtime }: Slow2I) {
  await wait(loadtime);
  return <div id="loaded">Loaded</div>;
}

function WithHandlers() {
  return (
    <button
      type="button"
      id="click1"
      onclick={() => {
        window.sessionStorage.setItem("clicked", "true");
      }}
    >
      Click me
    </button>
  );
}

function WithAPIClientData() {
  return (
    <button
      type="button"
      id="click2"
      onclick={withClientData({ foo: "bar" }, (ev, actions, data) => {
        window.sessionStorage.setItem("serverData", data.foo);
      })}
    >
      Click me
    </button>
  );
}

export const DynamicComponentTId = "dynamic-slow";
export const DynamicComponentT = APIC(
  {
    id: DynamicComponentTId,
    requestHandler: async () => {
      await wait(100);
      return { resource: "Slow resource" };
    },
  },
  async function* ({ resource }) {
    yield <p id="loading2">Loading</p>;
    await wait(100);
    return <p id="loaded2">{resource}</p>;
  },
);

export const APICReloadTest = new APICBuilder("apic-reload", (req) => {
  const reloads = parseInt(req.query["reloads"] as string, 10);
  console.log({ reloads });
  return { reloads };
}).render(({ reloads }) => (
  <button
    type="button"
    id="click3"
    onclick={withClientData({ reloads }, (ev, actions, data) => {
      debugger;
      void actions.refetchAPIC("apic-reload", { reloads: data.reloads + 1 });
    })}
  >
    Reloads: {reloads}
  </button>
));

export function App({ loadtime }: { loadtime: number }) {
  return (
    <main>
      <p>Hello world</p>
      <Lazy loading={<div id="loading">Loading...</div>}>
        <Slow2 loadtime={loadtime} />
      </Lazy>
      <Slow />
      <DynamicComponentT resource={""} />
      <WithAPIClientData />
      <WithHandlers />
      <APICReloadTest reloads={0} />
      <NewComponent />
    </main>
  );
}
