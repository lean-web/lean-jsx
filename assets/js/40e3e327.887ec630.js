"use strict";(self.webpackChunklean_jsx_docs=self.webpackChunklean_jsx_docs||[]).push([[1643],{876:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>h});var r=n(2784);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),l=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=l(e.components);return r.createElement(c.Provider,{value:t},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=l(n),m=a,h=d["".concat(c,".").concat(m)]||d[m]||u[m]||o;return n?r.createElement(h,i(i({ref:t},p),{},{components:n})):r.createElement(h,i({ref:t},p))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=m;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s[d]="string"==typeof e?e:a,i[1]=s;for(var l=2;l<o;l++)i[l]=n[l];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},8799:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>s,toc:()=>l});var r=n(7896),a=(n(2784),n(876));const o={sidebar_position:3},i="HTTP streaming",s={unversionedId:"architecture/streaming",id:"architecture/streaming",title:"HTTP streaming",description:"Chunked Transfer Encoding or HTTP streaming has been available since HTTP 1.1. However, most web frameworks -either server-driven or SSR-based- don't fully take advantage of this feature by default. Developers need to explicitely configure their endpoint handlers to provide a streamed response.",source:"@site/docs/architecture/streaming.md",sourceDirName:"architecture",slug:"/architecture/streaming",permalink:"/lean-jsx/docs/architecture/streaming",draft:!1,tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"Server-side JSX",permalink:"/lean-jsx/docs/architecture/components"},next:{title:"Static and dynamic content",permalink:"/lean-jsx/docs/architecture/static-vs-dynamic"}},c={},l=[{value:"Are nested components streamed correctly?",id:"are-nested-components-streamed-correctly",level:2}],p={toc:l},d="wrapper";function u(e){let{components:t,...o}=e;return(0,a.kt)(d,(0,r.Z)({},p,o,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"http-streaming"},"HTTP streaming"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Chunked_transfer_encoding"},"Chunked Transfer Encoding")," or HTTP streaming has been available since HTTP 1.1. However, most web frameworks -either server-driven or SSR-based- don't fully take advantage of this feature by default. Developers need to explicitely configure their endpoint handlers to provide a streamed response."),(0,a.kt)("p",null,"HTTP streaming allows HTTP servers to return a response to the client in ",(0,a.kt)("em",{parentName:"p"},"chunks")," or parts:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js"},"app.all('/', function (req, res, next) {\n\n  res.writeHead(200, {\n    'Content-Type': 'text/plain',\n    'Transfer-Encoding': 'chunked'\n  })\n\n  res.write('<body>');\n  res.write('<h1>Title</h1>');\n  // ...\n  res.write('</body>')\n\n  res.end()\n  next()\n});\n")),(0,a.kt)("p",null,"The browser then can start rendering chunks as it receives them, instead of waiting for the whole HTML response to be computed and sent. This has great performance implication, as users can see content (and ",(0,a.kt)("a",{parentName:"p",href:"/docs/architecture/components#on-inlined-script-tags"},"interact with it if the JavaScript is already available"),")."),(0,a.kt)("p",null,"By default, LeanJSX returns all JSX-based content with ",(0,a.kt)("inlineCode",{parentName:"p"},"Chunked Transfer Encoding"),", which means that components will be rendered as they are computed."),(0,a.kt)("p",null,"Let's take another look at the server route handler:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-jsx"},'// using Express:\napp.use("/", async (req, res) => {\n    // ...\n    await LeanEngine.renderWithTemplate(\n        res,\n        <Home />,\n        // ...options\n    );\n});\n')),(0,a.kt)("p",null,"The method ",(0,a.kt)("inlineCode",{parentName:"p"},"LeanEngine.renderWithTemplate")," receives the ",(0,a.kt)("inlineCode",{parentName:"p"},"Response")," object. Then, internally LearnJSX computes all JSX content and produces a ",(0,a.kt)("a",{parentName:"p",href:"https://nodejs.org/api/stream.html#readable-streams"},"NodeJS Readable stream")," which in turn is piped to the ",(0,a.kt)("inlineCode",{parentName:"p"},"Response"),"."),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"Activity diagram showing how JSX components are streamed one by one directly to the browser",src:n(7463).Z,width:"1102",height:"828"})),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Rendering will only be blocked for non-asynchronous, slow loading components"),"."),(0,a.kt)("h2",{id:"are-nested-components-streamed-correctly"},"Are nested components streamed correctly?"),(0,a.kt)("p",null,"Yes, browsers can handle rendering nested components in chunks. This is why we can return ",(0,a.kt)("inlineCode",{parentName:"p"},"<body>")," first, then all the page contents and only send the closing ",(0,a.kt)("inlineCode",{parentName:"p"},"</body>")," at the end."),(0,a.kt)("p",null,"In the next section, we will discuss how interactivity works in this chunked-response environment."))}u.isMDXComponent=!0},7463:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/rendering-diagram-5ff8997da99b0abd35eabe4d2ca88efd.png"}}]);