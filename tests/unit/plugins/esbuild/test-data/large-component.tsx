import { withClientData } from "@/components";

export function DeeplyNestedComponent() {
  return (
    <button
      onclick={withClientData({}, (ev, actions) => {
        void actions.refetchAPIC("my-element2", {});
      })}
    >
      Click to greet user
    </button>
  );
}

/**
 * Contains a handler with the exact same code as DeeplyNestedComponent
 * @returns
 */
export function DeeplyNestedComponent2() {
  return (
    <button
      onclick={withClientData({}, (ev, actions) => {
        void actions.refetchAPIC("my-element2", {});
      })}
    >
      Click to greet user
    </button>
  );
}

export function NestedComponent() {
  return (
    <div>
      <DeeplyNestedComponent />
      <button
        onclick={withClientData({}, (ev, actions) => {
          void actions.refetchAPIC("my-element", {});
        })}
      >
        Click to greet user
      </button>
      <DeeplyNestedComponent2 />
    </div>
  );
}

function LoopedComponent() {
  return (
    <>
      {new Array(5).fill(true).map((_, index) => (
        <button
          onclick={withClientData({ index }, (ev, _, data) =>
            console.log(data.index),
          )}
        >
          Click {index}
        </button>
      ))}
    </>
  );
}

export function MyComponent() {
  const user = { firstName: "John" };
  return (
    <div>
      <NestedComponent />
      <LoopedComponent />
      <button
        onclick={withClientData(user, (ev, actions, data) => {
          alert(`Hello ${data.firstName}`);
        })}
      >
        Click to greet user
      </button>
    </div>
  );
}
