"use strict";(self.webpackChunklean_jsx_docs=self.webpackChunklean_jsx_docs||[]).push([[7309],{876:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>m});var a=n(2784);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=a.createContext({}),u=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},d=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},h=a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,l=e.originalType,s=e.parentName,d=i(e,["components","mdxType","originalType","parentName"]),p=u(n),h=o,m=p["".concat(s,".").concat(h)]||p[h]||c[h]||l;return n?a.createElement(m,r(r({ref:t},d),{},{components:n})):a.createElement(m,r({ref:t},d))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var l=n.length,r=new Array(l);r[0]=h;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[p]="string"==typeof e?e:o,r[1]=i;for(var u=2;u<l;u++)r[u]=n[u];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}h.displayName="MDXCreateElement"},9291:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>r,default:()=>c,frontMatter:()=>l,metadata:()=>i,toc:()=>u});var a=n(7896),o=(n(2784),n(876));const l={slug:"the-case-for-leanjsx-p2",title:"The case for LeanJSX (part 2)",authors:"pfernandom",tags:["leanjsx","release","alpha"]},r=void 0,i={permalink:"/lean-jsx/blog/the-case-for-leanjsx-p2",source:"@site/blog/2023-11-02-the-need-for-leanjsx.md",title:"The case for LeanJSX (part 2)",description:"After a walk down memory lane in web development, let us jump into the question: Why did I wrote LeanJSX?",date:"2023-11-02T00:00:00.000Z",formattedDate:"November 2, 2023",tags:[{label:"leanjsx",permalink:"/lean-jsx/blog/tags/leanjsx"},{label:"release",permalink:"/lean-jsx/blog/tags/release"},{label:"alpha",permalink:"/lean-jsx/blog/tags/alpha"}],readingTime:8.15,hasTruncateMarker:!1,authors:[{name:"Pedro Marquez Soto",title:"Creator of LeanJSX",url:"https://github.com/pfernandom",imageURL:"https://github.com/pfernandom.png",key:"pfernandom"}],frontMatter:{slug:"the-case-for-leanjsx-p2",title:"The case for LeanJSX (part 2)",authors:"pfernandom",tags:["leanjsx","release","alpha"]},nextItem:{title:"The case for LeanJSX (part 1)",permalink:"/lean-jsx/blog/the-case-for-leanjsx-p1"}},s={authorsImageUrls:[void 0]},u=[{value:"If not a framework, then what?",id:"if-not-a-framework-then-what",level:2},{value:"Going vanilla",id:"going-vanilla",level:2},{value:"More vanilla challenges: Sharing data between JavaScript and HTML",id:"more-vanilla-challenges-sharing-data-between-javascript-and-html",level:3},{value:"LeanJSX in the middle land",id:"leanjsx-in-the-middle-land",level:2},{value:"Finally: The use case for LeanJSX",id:"finally-the-use-case-for-leanjsx",level:3}],d={toc:u},p="wrapper";function c(e){let{components:t,...n}=e;return(0,o.kt)(p,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"After a walk down memory lane in web development, let us jump into the question: Why did I wrote LeanJSX?"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},"TLDR; LeanJSX is an alternative for all those web-based projects when ",(0,o.kt)("em",{parentName:"p"},'"you don\'t need a framework"')," but you still want to build server-driven web applications in a modular, component-based approach that React has made popular for the past decade, without having to use React."),(0,o.kt)("p",{parentName:"blockquote"},"It's like writing React applications, but using vanilla JavaScript and plain HTML under the hood.")),(0,o.kt)("h2",{id:"if-not-a-framework-then-what"},"If not a framework, then what?"),(0,o.kt)("p",null,"In the previous blog post I mentioned I agree with the idea that not all web applications need a full-fledged JavaScript framework:"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},(0,o.kt)("em",{parentName:"p"},'"There is a high change that your application don\'t need a framework"'))),(0,o.kt)("p",null,"One day after catching myself saying these words, I also asked myself:"),(0,o.kt)("blockquote",null,(0,o.kt)("p",{parentName:"blockquote"},(0,o.kt)("em",{parentName:"p"},'"Then, what do I ',(0,o.kt)("strong",{parentName:"em"},"need"),'?"'))),(0,o.kt)("p",null,"It's an oversimplification of the actual question in my head. A better wording would be: ",(0,o.kt)("em",{parentName:"p"},'"If most applications ',(0,o.kt)("strong",{parentName:"em"},"don't"),' need a JavaScript framework, what options do they have?"'),"."),(0,o.kt)("p",null,"The only answer I've heard for questions like that is just ",(0,o.kt)("em",{parentName:"p"},'"vanilla JavaScript and HTML"'),"."),(0,o.kt)("p",null,"So I tried it, and I really disliked it. I mean, I could see the ",(0,o.kt)("em",{parentName:"p"},"didactic")," benefit of manually writing a web application using only HTML and JavaScript, but I could also see how hard to maintain that was."),(0,o.kt)("h2",{id:"going-vanilla"},"Going vanilla"),(0,o.kt)("p",null,"Let's look at a simple example of vanilla JavaScript. You have a simple HTML button:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},"<button>Click me</button>\n")),(0,o.kt)("p",null,"Now, a button that does nothing when you click it is useless. Let's keep throwing vanilla at it."),(0,o.kt)("p",null,"First, we need to get a reference to this element in JavaScript and add an event listener:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"const button = document.querySelector('button');\nbutton.addEventListener('click', (ev) => {\n    console.log('Click!')\n})\n")),(0,o.kt)("p",null,"Not too bad, but also not good:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"There can be more than one button, so we need to add a ID or any other unique attribute to the button."),(0,o.kt)("li",{parentName:"ul"},"This has to be careful wrapped in ",(0,o.kt)("em",{parentName:"li"},"another")," event listener for ",(0,o.kt)("inlineCode",{parentName:"li"},"DOMContentLoaded")," or ",(0,o.kt)("inlineCode",{parentName:"li"},"load"),". Otherwise, the button ",(0,o.kt)("em",{parentName:"li"},"may not be there")," at all!.")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},'<button id="btn1">Click me</button>\n')),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"document.addEventListener('DOMContentLoaded', () => {\n    const button = document.querySelector('#btn1');\n    button.addEventListener('click', (ev) => {\n        console.log('Click!')\n    })\n})\n")),(0,o.kt)("p",null,'Again, not to bad, but I wouldn\'t call this "awesome". From a development ergonomics point of view:'),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"You have to keep two separate context in mind at the same time."),(0,o.kt)("li",{parentName:"ul"},'This is the minimal code needed for one single event handler. No way around the "get element reference, then add event listener" two-step process.')),(0,o.kt)("p",null,"Now, compare that with JSX:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"<button onclick={() => {console.log('Click')}}>Click me</button>\n")),(0,o.kt)("p",null,"Obviously ",(0,o.kt)("em",{parentName:"p"},"is not that simple"),": This needs to be transpiled into actual JavaScript, loaded and rendered. And if we need to support SEO, it has to be SSR'ed. But leave those things aside for a second, and focus on the JSX itself:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"No need to switch context (and files) between HTML and JavaScript. It's all in the same place."),(0,o.kt)("li",{parentName:"ul"},"Not manually having to get a reference to the DOM element."),(0,o.kt)("li",{parentName:"ul"},"No need to guarantee that the DOM is loaded. Whoever implemented the underlying JSX rendering took care of that.")),(0,o.kt)("p",null,"I won't argue that this is the best solution to this ergonomics problem, but it is ",(0,o.kt)("em",{parentName:"p"},"a")," solution, and one that thousands of developers are already familiar with, for that matter."),(0,o.kt)("h3",{id:"more-vanilla-challenges-sharing-data-between-javascript-and-html"},"More vanilla challenges: Sharing data between JavaScript and HTML"),(0,o.kt)("p",null,'I think one of the things that I disliked the most of pure vanilla JavaScript is around development ergonomics: There is just so much manual wiring needed to just make a button "clickable", wiring that is hard or just time consuming to abstract a way in a maintenable way.'),(0,o.kt)("p",null,"The previous example could have been addressed by just bringing the old, reliable tools: Go JQuery on that button! "),(0,o.kt)("p",null,"But, what if we want to write a button to greet our users?"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},'<button id="btn1">Say hi to John</button>\n')),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"document.addEventListener('DOMContentLoaded', () => {\n    const button = document.querySelector('#btn1');\n    button.addEventListener('click', (ev) => {\n        console.log('Hi John!')\n    })\n})\n")),(0,o.kt)("p",null,"It's all good if ",(0,o.kt)("inlineCode",{parentName:"p"},'"John"')," can be hardcoded. But, what if that comes from a database?"),(0,o.kt)("p",null,"Now the whole thing gets more complicated:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},'<button id="btn1">Loading...</button>\n')),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"document.addEventListener('DOMContentLoaded', () => {\n    const button = document.querySelector('#btn1');\n\n   fetchUser().then(user => {\n    button.textContent = `Say hi to ${user.firstName}`\n        button.addEventListener('click', (ev) => {\n            console.log(`Hi ${user.firstName}`)\n        })\n   })\n})\n")),(0,o.kt)("p",null,"Users will only be able to click on this button ",(0,o.kt)("em",{parentName:"p"},"after")," the whole page loads and the user information is fetched. Before that, you only have a useless button.  JQuery itself cannot save us from this."),(0,o.kt)("p",null,"Of course, this is only one approach. You could also:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Return the data on page load as an embedded stringified JSON and retrieve it using JavaScript, ",(0,o.kt)("em",{parentName:"li"},"then")," updating the button contents and the event listener.",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"We save ourselves a round-trip to the server, at the cost of having to manually store state somewhere in the page, being careful of avoiding naming collitions because this is now global state."))),(0,o.kt)("li",{parentName:"ul"},"Render ",(0,o.kt)("em",{parentName:"li"},"both")," HTML and JavaScript code on the server.",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},'That could save us from having to show a "Loading..." message and have to update the button contents with JavaScript, but we get a new set of challenges:',(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"The contents of the JavaScript file need to be dynamically rendered on the server. Writing tests for this would be a nightmare.")))))),(0,o.kt)("p",null,"None of this solutions are impossible. In fact, we've been doing this for decades in traditional server-driven web frameworks."),(0,o.kt)("p",null,"But let's just look again to JSX:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"async function GreeBtn() {\n    const user = await fetchUser();\n    return <button onclick={() => {\n            console.log(`Hi! ${user.firstName}`)\n        }}>\n        Say hi to {user.firstName}\n    </button>\n}\n")),(0,o.kt)("p",null,"Again, leaving implementation work aside, the development experience is very straightforward:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"All code related to this piece of content is collocated."),(0,o.kt)("li",{parentName:"ul"},"All rendering-related behavior is encapsulated in a single place, instead of being spread in multiple files",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Granted, most of the time the code for the event handler wouldn't be fully inlined, but in JSX you can just define a function right above the JSX definition.")))),(0,o.kt)("p",null,"But we cannot ignore the implementation work anymore, nor the concerns many developers have regarding React Server Components (to which this last JSX example is extremely similar):"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"React client components cannot be ",(0,o.kt)("em",{parentName:"li"},"async"),"."),(0,o.kt)("li",{parentName:"ul"},"React server components are still working on defining better boundaries between which components run in the server versus which run on the client, to avoid confusions or leaking sensitive information from the server into the client."),(0,o.kt)("li",{parentName:"ul"},"At the end, this is pure JavaScript, which needs to be SSR'd, loaded from a bundle on the client and re-hydrated, all before the button can be useful.")),(0,o.kt)("p",null,"It would be awesome if we could just write this piece of JSX, have it rendered once directly as HTML and get all JavaScript just for the event handling wiring for free. Here is where a make my case for LeanJSX."),(0,o.kt)("h2",{id:"leanjsx-in-the-middle-land"},"LeanJSX in the middle land"),(0,o.kt)("p",null,"In LeanJSX, the last example of JSX we just saw is a valid component. Also the following example is valid:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-jsx"},"async function* GreeBtn() {\n    // render something while we wait:\n    yield (<>Loading</>)\n\n    const user = await fetchUser();\n    return <button onclick={() => {\n            console.log(`Hi! ${user.firstName}`)\n        }}>\n        Say hi to {user.firstName}\n    </button>\n}\n")),(0,o.kt)("p",null,"LeanJSX will take this compoenent and translate it into pure HTML and a bit of vanilla JavaScript, which then -with the power of ",(0,o.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Chunked_transfer_encoding"},"chunked transfer encoding")," will be streamed and rendered in the browser piece-by-piece:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-html"},'<div data-placeholder="element-0">Loading</div>\n\n<template id="element-0">\n    <<button data-action="element-1">Say hi to John</button>\n    <script>\n        (function(){\n        document.querySelector(\'[data-action="element-1"]\').addEventListener(\'click\', () => alert(`Hi! John`))\n        }).call({})\n    <\/script>\n</template>\n<script>\n    sxl.fillPlaceHolder("element-0");  \n<\/script>\n')),(0,o.kt)("p",null,"Looks a bit convulated, but in practice this is what happens:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"A placeholder element containing ",(0,o.kt)("inlineCode",{parentName:"li"},"Loading")," will be rendered in the browser."),(0,o.kt)("li",{parentName:"ul"},"Once the user information is fully fetched, a ",(0,o.kt)("inlineCode",{parentName:"li"},"<template>")," element is sent to the browser, along with inlined JavaScript code which will:",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Replace the loading placeholder with the actual button contents."),(0,o.kt)("li",{parentName:"ul"},"Create the event handler for the ",(0,o.kt)("inlineCode",{parentName:"li"},"onclick")," event, passing the correct handler to it.")))),(0,o.kt)("p",null,"I know, you may have taken a step back in horror after seeing those inlined ",(0,o.kt)("inlineCode",{parentName:"p"},"<script>")," tags. But there is a good reasong behind that: The button will be rendered and interactive ",(0,o.kt)("em",{parentName:"p"},"before")," the page or any other JavaScript bundle finishes loading. No need to wait for a ",(0,o.kt)("inlineCode",{parentName:"p"},"DOMContentLoaded")," event."),(0,o.kt)("p",null,"Wait, but ",(0,o.kt)("inlineCode",{parentName:"p"},"sxl.fillPlaceHolder")," needs to come from somewhere, right?"),(0,o.kt)("p",null,"That is correct. LeanJSX ",(0,o.kt)("em",{parentName:"p"},"does")," include one single JavaScript file at the top of the document. You can see the pre-minified contents of that file ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/lean-web/lean-jsx/blob/main/src/web/wiring.ts"},"here"),"."),(0,o.kt)("p",null,"It's a minimal-sized file which, adding GZIP and cache in top of it, has an almost neglectible impact on the page. the size for this script also remaing constant regardless of the number of components in your application."),(0,o.kt)("p",null,"As long as you're careful of not passing tons of code to your event handlers, that blocking, inline JavaScript code will be pure goodness."),(0,o.kt)("h3",{id:"finally-the-use-case-for-leanjsx"},"Finally: The use case for LeanJSX"),(0,o.kt)("p",null,"LeanJSX is not a framework. It's basically a rendering engine for the server that uses JSX and defines a set of conventions on how to build web UIs; these conventions are based in how we currently build React applications."),(0,o.kt)("p",null,(0,o.kt)("strong",{parentName:"p"},"I built LeanJSX for all those cases when ",(0,o.kt)("em",{parentName:"strong"},'"you don\'t need a framework"')," but you still want to build server-driven web applications in a modular, component-based approach.")),(0,o.kt)("p",null,"It's like writing React applications, but using vanilla JavaScript and plain HTML under the hood."),(0,o.kt)("p",null,"For a better insight on the use cases and limitations of LeanJSX, take a look at ",(0,o.kt)("a",{parentName:"p",href:"/docs/architecture/use-cases"},"our docs"),"."),(0,o.kt)("p",null,"There you can also find an in-dept explanation of how LeanJSX works under the hood, and how it handles some of the challenges of building modern web applications."))}c.isMDXComponent=!0}}]);