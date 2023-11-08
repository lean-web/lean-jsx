"use strict";(self.webpackChunklean_jsx_docs=self.webpackChunklean_jsx_docs||[]).push([[6951],{876:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>h});var a=n(2784);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var i=a.createContext({}),c=function(e){var t=a.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},p=function(e){var t=c(e.components);return a.createElement(i.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),d=c(n),m=r,h=d["".concat(i,".").concat(m)]||d[m]||u[m]||o;return n?a.createElement(h,s(s({ref:t},p),{},{components:n})):a.createElement(h,s({ref:t},p))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,s=new Array(o);s[0]=m;var l={};for(var i in t)hasOwnProperty.call(t,i)&&(l[i]=t[i]);l.originalType=e,l[d]="string"==typeof e?e:r,s[1]=l;for(var c=2;c<o;c++)s[c]=n[c];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},4969:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>i,contentTitle:()=>s,default:()=>u,frontMatter:()=>o,metadata:()=>l,toc:()=>c});var a=n(7896),r=(n(2784),n(876));const o={sidebar_position:5},s="Event handlers, state, and context management",l={unversionedId:"architecture/state-and-context",id:"architecture/state-and-context",title:"Event handlers, state, and context management",description:"LeanJSX approach to content rendering requires developers to manage application state in a different way than regular JavaScript frameworks.",source:"@site/docs/architecture/state-and-context.md",sourceDirName:"architecture",slug:"/architecture/state-and-context",permalink:"/lean-jsx/docs/architecture/state-and-context",draft:!1,tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"Static and dynamic content",permalink:"/lean-jsx/docs/architecture/static-vs-dynamic"},next:{title:"Use cases and limitations",permalink:"/lean-jsx/docs/architecture/use-cases"}},i={},c=[{value:"Local context",id:"local-context",level:2},{value:"Local state boundaries",id:"local-state-boundaries",level:3},{value:"Event handlers and context",id:"event-handlers-and-context",level:4},{value:"The webAction helper",id:"the-webaction-helper",level:2},{value:"Global context",id:"global-context",level:2},{value:"Semi-dynamic page state",id:"semi-dynamic-page-state",level:3}],p={toc:c},d="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(d,(0,a.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"event-handlers-state-and-context-management"},"Event handlers, state, and context management"),(0,r.kt)("p",null,"LeanJSX approach to content rendering requires developers to manage application state in a different way than regular JavaScript frameworks."),(0,r.kt)("p",null,"Currently, LeanJSX-based components have no concept of ",(0,r.kt)("strong",{parentName:"p"},"hooks")," nor state updates (there is no state!), and components cannot be re-rendered on the browser (in the traditional, React-style). From the browser's point of view, there are no components -only those defined by developers using LeanJSX-, only HTML."),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"Work in progress. Future releases of LeanJSX will include default methods for updating components after page load. Meanwhile, developers can implement their own conten-update functionality.")),(0,r.kt)("p",null,"Additionally, since LeanJSX components are fully server rendered, component state is completely defined and maintained on the server."),(0,r.kt)("h2",{id:"local-context"},"Local context"),(0,r.kt)("p",null,"LeanJSX components can define their own data for rendering:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-jsx"},'funcion MyComponent() {\n    const user = {firstName:"John", lastName:"Doe"}\n    return <p>Welcome {user.firstName} {user.lastName}</p>\n}\n')),(0,r.kt)("p",null,"State can also be retrieved resources like databases and service APIs:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-jsx"},"async function* MyComponent() {\n    yield (<>Loading</>);\n    const data = await fetchData();\n    return <main>\n            <h1>Title</h1>\n            <p>{data.fetchedData}</p>\n        </main>\n}\n")),(0,r.kt)("p",null,"State can also be passed to components as properties -like in regular React components-:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-tsx"},"interface MyProps extends SXL.Props {\n    title:string;\n}\n\nexport function Layout({ title, children }: MyProps) {\n   return <>\n        <h1>{title}</h1>\n        <div>{children}</div>\n   </>\n}\n")),(0,r.kt)("h3",{id:"local-state-boundaries"},"Local state boundaries"),(0,r.kt)("p",null,"Component state is, by default, kept only on the server. The ",(0,r.kt)("inlineCode",{parentName:"p"},"user")," object in the example above is never sent to the browser, only the rendered content is returned."),(0,r.kt)("p",null,"This approach has the benefit of setting ",(0,r.kt)("strong",{parentName:"p"},"data privacy by default"),": You can request sensitive data without risking leaking it to users:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-jsx"},"async funcion MyComponent() {\n    const userSecrets = await fetchUserSecrets()\n    const userData = await fetchUserData(userSecrets)\n    return <p>Welcome {userData.firstName} {userData.lastName}</p>\n}\n")),(0,r.kt)("p",null,"In this example, only ",(0,r.kt)("inlineCode",{parentName:"p"},"userData.firstName")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"userData.lastName")," are sent to the browser, while ",(0,r.kt)("inlineCode",{parentName:"p"},"userSecrets")," and the rest of ",(0,r.kt)("inlineCode",{parentName:"p"},"useData")," remain safely stored on the server."),(0,r.kt)("p",null,"The only time LeanJSX returns non-HTML data to the client is when using ",(0,r.kt)("strong",{parentName:"p"},"event handlers"),"."),(0,r.kt)("h4",{id:"event-handlers-and-context"},"Event handlers and context"),(0,r.kt)("p",null,"LeanJSX components support adding event handlers directly to HTML content:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-jsx"},"function MyComponent() {\n    return <button onclick={() => alert(`Hello John`)}>\n            Click to greet user\n        </button>\n}\n")),(0,r.kt)("p",null,"First, notice that ",(0,r.kt)("inlineCode",{parentName:"p"},"onclick")," follows the same syntax as native HTML elements (not ",(0,r.kt)("inlineCode",{parentName:"p"},"onClick")," like React). This is true for any ",(0,r.kt)("a",{parentName:"p",href:"https://www.w3schools.com/tags/ref_eventattributes.asp"},"event attribute")," property in any HTML element."),(0,r.kt)("p",null,"Second, event handlers are client-rendered by default. There is no way to make these work without sending the contents of the handler attribute back to the client."),(0,r.kt)("p",null,"For the component above, LeanJSX will stream the following HTML content:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-html"},'<button data-action="element-3">Click to greet user</button>\n<script type="application/javascript">\n    document.querySelector(\'[data-action="element-3"]\')\n        .addEventListener(\'click\', () => alert(`Hello John`));\n<\/script>\n')),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"If an event handler is defined in a component(e.g. ",(0,r.kt)("inlineCode",{parentName:"li"},"onclick"),"), LeanJSX will automatically attach an event listener for the element in an inline script element which will be rendered immediately after the component is rendered."),(0,r.kt)("li",{parentName:"ul"},"Only variables defined in the scope of the event handler will be sent to the client. Any reference to other variables will result in an ",(0,r.kt)("inlineCode",{parentName:"li"},"undefined")," variable.")),(0,r.kt)("p",null,"Now, when a user clicks on the button -even before the rest of the page finishes loading-, the event handler will execute correctly."),(0,r.kt)("p",null,"What if the event handler needs access to data defined ",(0,r.kt)("em",{parentName:"p"},"outside")," the event handler's scope? In this case, we can add attributes to the ",(0,r.kt)("em",{parentName:"p"},"scope")," of the function component: ",(0,r.kt)("inlineCode",{parentName:"p"},"this"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-tsx"},'type UserContext = { user: { firstName: string } };\n\nfunction Home(this: UserContext) {\n    this.user = { firstName: "John" };\n    return (\n        <button onclick={() => alert(this.user.firstName)}>\n            Click to greet user\n        </button>\n    );\n}\n')),(0,r.kt)("p",null,"This component will be rendered as follows:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-html"},'<button data-action="element-3">Click to greet user</button>\n<script type="application/javascript">\n    (function(){\n        document.querySelector(\'[data-action="element-3"]\')\n            .addEventListener(\'click\', () => alert(this.user.firstName));\n    }).call({"user":{"firstName":"John"}});\n<\/script>\n')),(0,r.kt)("p",null,"By allowing developers to set content into the component's function ",(0,r.kt)("inlineCode",{parentName:"p"},"this")," scope, we allow them to choose what data they want to expose to the client, preserving sensitive data on the server's scope."),(0,r.kt)("h2",{id:"the-webaction-helper"},"The webAction helper"),(0,r.kt)("p",null,"An alternative to setting values to the component's scope is to use the ",(0,r.kt)("inlineCode",{parentName:"p"},"webAction")," helper:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-jsx"},'import { webAction } from "lean-jsx/lib/server/components";\n\nfunction MyComponent(this: UserContext) {\n    const user = { firstName: "John" };\n    return (\n        <button\n            onclick={webAction(user, (ev, webContext) => {\n                alert(`Hello ${webContext?.data.firstName}`);\n            })}\n        >\n            Click to greet user\n        </button>\n    );\n}\n')),(0,r.kt)("p",null,"Data that needs to be serialized to the browser must be passed as the first parameter to ",(0,r.kt)("inlineCode",{parentName:"p"},"webAction"),"."),(0,r.kt)("p",null,"The second parameter is the handler function, which receives the ",(0,r.kt)("inlineCode",{parentName:"p"},"Event")," object for the handler in addition to a second parameter ",(0,r.kt)("inlineCode",{parentName:"p"},"webContext"),". This object has a ",(0,r.kt)("inlineCode",{parentName:"p"},"data")," attribute, which contains the data passed as the first parameter of ",(0,r.kt)("inlineCode",{parentName:"p"},"webAction"),"."),(0,r.kt)("p",null,"This component would be rendered to as follows:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-html"},'<button data-action="element-3">Click to greet user</button>\n<script type="application/javascript">\n    document.querySelector(\'[data-action="element-3"]\')\n        .addEventListener(\'click\', (ev) => {\n        const h = (ev, webContext) => {\n            alert(`Hello ${webContext?.data.firstName}`);\n        };\n        h(ev, {\n            data: {"firstName":"John"},\n            // ... other web context props\n        });\n    });\n<\/script>\n')),(0,r.kt)("p",null,"Why can't we just pass the variable into the event handler?"),(0,r.kt)("p",null,"Unlike React components, LeanJSX makes a very hard distinction between server/browser boundaries: ",(0,r.kt)("strong",{parentName:"p"},"All content is server-based, unless explicitely configured otherwise"),"."),(0,r.kt)("p",null,"By explicitely defining which data will be sent to the browser, we reduce the chance of leaking sensitive information or causing confusion about where rendering is actually happening (the server)."),(0,r.kt)("h2",{id:"global-context"},"Global context"),(0,r.kt)("p",null,"In the React world exists the concept of ",(0,r.kt)("a",{parentName:"p",href:"https://react.dev/learn/passing-data-deeply-with-context"},"context"),"."),(0,r.kt)("p",null,"Context allows developers to define state that isn't fully owned by a single component, and instead is meant to be accessed by multiple parts of the application."),(0,r.kt)("p",null,"The analog feature in LeanJSX for context is ",(0,r.kt)("inlineCode",{parentName:"p"},"GlobalContext"),". The global context is a single object that lives for the duration of a single request in the server. Internally, LeanJSX passes a reference to ",(0,r.kt)("inlineCode",{parentName:"p"},"globalContext")," to all components, allowing them to access this shared state."),(0,r.kt)("p",null,"When using TypeScript, a global state is defined like follows:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},'export interface RequestQueryParams {\n    someOption?: string;\n}\n\ndeclare module "lean-jsx/src/types/context" {\n    interface SXLGlobalContext extends RequestQueryParams {}\n}\n')),(0,r.kt)("p",null,"The default pattern to define the contents of the global state is to pass query parameters to it:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-jsx"},'export function parseQueryParams(req: Request): RequestQueryParams {\n    return {\n        someOption: req.query?.someOption\n    };\n}\n\napp.use("/", async (req, res) => {\n    const globalContext = parseQueryParams(req);\n\n    await LeanApp.renderWithTemplate(\n        res,\n        <Home />,\n        globalContext,\n        //...options\n    );\n});\n')),(0,r.kt)("p",null,"Now, the value for the query parameter ",(0,r.kt)("inlineCode",{parentName:"p"},"someOption")," will be available for any component:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-jsx"},"function Home(props: SXL.Props) {\n    const { someOption } = props.globalContext?.someOption;\n    // use the context...\n    return (\n       <>...</>\n    );\n}\n\n// No need to pass the global context:\n<Home/>\n")),(0,r.kt)("h3",{id:"semi-dynamic-page-state"},"Semi-dynamic page state"),(0,r.kt)("p",null,"An advantage of setting the values of global context using query or path parameters is that we can conditionally render different content for the same page."),(0,r.kt)("p",null,"For simple applications that require conditional content rendering, query-param-driven context is a way to offer semi-dynamic behavior without having to keep track of session state on the server. These kind of web applications are called ",(0,r.kt)("strong",{parentName:"p"},"stateless apps"),", and they are extremely useful in the context of ",(0,r.kt)("a",{parentName:"p",href:"https://www.redhat.com/en/topics/cloud-native-apps/stateful-vs-stateless"},"micro-services architectures"),"."),(0,r.kt)("p",null,"When a web application is stateless, it's very easy to create distributed applications: Web applications can be deployed in multiple instances behind a ",(0,r.kt)("strong",{parentName:"p"},"load balancer"),", and user traffic can be distributed evenly among them without having to keep ",(0,r.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html"},"sticky sessions"),"."))}u.isMDXComponent=!0}}]);