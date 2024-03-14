import { WebActions } from "lean-web-utils/server";
import { DynamicComponent, addEventListener } from "lean-web-utils/web";
import { fillPlaceHolder, actionHandler } from "./wiring";

// DynamicComponent.register();

// function isElement(e: Node): e is Element {
//   return "tagName" in e;
// }

// // TODO: Avoid sending down the script for the event handlers
// function wireListeners(element: Element) {
//   const listeners = Array.from(element.querySelectorAll("[x-on]"));
//   if (listeners.length > 0) {
//     listeners.forEach((l) => {
//       const target = l.getAttribute("x-target");
//       if (target) {
//         const handerl = actionHandler(
//           function (ev, ctx) {
//             console.log(
//               "Calling",
//               (window as unknown as { sxl_user: Record<string, Function> })
//                 .sxl_user[target],
//             );
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//             (
//               window as unknown as { sxl_user: Record<string, Function> }
//             ).sxl_user[target](ev, ctx);
//           },
//           { id: "p1" },
//         );
//         console.log("click", handerl);
//         l.addEventListener("click", handerl);
//       }
//     });
//   }
// }

// function observe() {
//   const observer = new MutationObserver((mutationRecords) => {
//     console.log({ mutationRecords });
//     mutationRecords.forEach((e) => {
//       const templates: Element[] = [];
//       Array.from(e.addedNodes).reduce((acc, n) => {
//         if (!isElement(n)) {
//           return acc;
//         }
//         if (n.tagName === "TEMPLATE") {
//           acc.push(n);
//         } else {
//           Array.from(n.querySelectorAll("template")).forEach((t) =>
//             acc.push(t),
//           );
//         }

//         return acc;
//       }, templates);

//       console.log({ templates });

//       //   templates.forEach((t) => {
//       //     console.log(t.id);
//       //     fillPlaceHolder(t.id);
//       //   });
//       e.addedNodes.forEach((n) => {
//         if (!isElement(n)) {
//           return;
//         }

//         // wireListeners(n);
//       });

//       e.removedNodes.forEach((e) => {
//         if (!isElement(e)) {
//           return;
//         }
//         Array.from(e.querySelectorAll("[data-action]")).forEach(
//           (actionElement) => {
//             queueMicrotask(() => {
//               const dataAction = actionElement.getAttribute("data-action");
//               if (dataAction) {
//                 const scriptTag = document.querySelector(
//                   `[data-action-script=${dataAction}]`,
//                 );
//                 scriptTag?.remove();
//               }
//             });
//           },
//         );
//       });
//     });
//   });
//   observer.observe(document.body, {
//     childList: true,
//     subtree: true,
//   });
//   //   wireListeners(document as unknown as Element);
// }

// // window.addEventListener("DOMContentLoaded", () => {
// //   observe();
// // });
// setTimeout(() => observe());

export {
  fillPlaceHolder,
  addEventListener,
  actionHandler,
  WebActions,
  DynamicComponent,
};
