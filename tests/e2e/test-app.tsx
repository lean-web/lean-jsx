import { APIC, Lazy } from "@/components";

async function wait(time: number) {
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

export const DynamicComponentTId = "dynamic-slow";
export const DynamicComponentT = APIC(
  {
    id: DynamicComponentTId,
    requestHandler: async () => {
      await wait(100);
      return { resource: "Slow resource" };
    },
  },
  ({ resource }) => {
    return <p id="loaded2">{resource}</p>;
  },
);

export function App({ loadtime }: { loadtime: number }) {
  return (
    <main>
      <p>Hello world</p>
      <Lazy loading={<div id="loading">Loading...</div>}>
        <Slow2 loadtime={loadtime} />
      </Lazy>
      <Slow />
      <DynamicComponentT resource={""} />
      <WithHandlers />
      <NewComponent />
    </main>
  );
}
