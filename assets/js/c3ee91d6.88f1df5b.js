"use strict";(self.webpackChunklean_jsx_docs=self.webpackChunklean_jsx_docs||[]).push([[9056],{3764:e=>{e.exports=JSON.parse('{"blogPosts":[{"id":"the-case-for-leanjsx-p2","metadata":{"permalink":"/lean-jsx/blog/the-case-for-leanjsx-p2","source":"@site/blog/2023-11-02-the-need-for-leanjsx.md","title":"The case for LeanJSX (part 2)","description":"After a walk down memory lane in web development, let us jump into the question: Why did I wrote LeanJSX?","date":"2023-11-02T00:00:00.000Z","formattedDate":"November 2, 2023","tags":[{"label":"leanjsx","permalink":"/lean-jsx/blog/tags/leanjsx"},{"label":"release","permalink":"/lean-jsx/blog/tags/release"},{"label":"alpha","permalink":"/lean-jsx/blog/tags/alpha"}],"readingTime":8.15,"hasTruncateMarker":false,"authors":[{"name":"Pedro Marquez Soto","title":"Creator of LeanJSX","url":"https://github.com/pfernandom","imageURL":"https://github.com/pfernandom.png","key":"pfernandom"}],"frontMatter":{"slug":"the-case-for-leanjsx-p2","title":"The case for LeanJSX (part 2)","authors":"pfernandom","tags":["leanjsx","release","alpha"]},"nextItem":{"title":"The case for LeanJSX (part 1)","permalink":"/lean-jsx/blog/the-case-for-leanjsx-p1"}},"content":"After a walk down memory lane in web development, let us jump into the question: Why did I wrote LeanJSX?\\n\\n> TLDR; LeanJSX is an alternative for all those web-based projects when _\\"you don\'t need a framework\\"_ but you still want to build server-driven web applications in a modular, component-based approach that React has made popular for the past decade, without having to use React.\\n>\\n> It\'s like writing React applications, but using vanilla JavaScript and plain HTML under the hood.\\n\\n## If not a framework, then what?\\n\\nIn the previous blog post I mentioned I agree with the idea that not all web applications need a full-fledged JavaScript framework:\\n\\n> _\\"There is a high change that your application don\'t need a framework\\"_\\n\\nOne day after catching myself saying these words, I also asked myself:\\n\\n> _\\"Then, what do I **need**?\\"_\\n\\nIt\'s an oversimplification of the actual question in my head. A better wording would be: _\\"If most applications **don\'t** need a JavaScript framework, what options do they have?\\"_.\\n\\nThe only answer I\'ve heard for questions like that is just _\\"vanilla JavaScript and HTML\\"_.\\n\\nSo I tried it, and I really disliked it. I mean, I could see the _didactic_ benefit of manually writing a web application using only HTML and JavaScript, but I could also see how hard to maintain that was.\\n\\n## Going vanilla\\n\\nLet\'s look at a simple example of vanilla JavaScript. You have a simple HTML button:\\n\\n```html\\n<button>Click me</button>\\n```\\n\\nNow, a button that does nothing when you click it is useless. Let\'s keep throwing vanilla at it.\\n\\nFirst, we need to get a reference to this element in JavaScript and add an event listener:\\n\\n```js\\nconst button = document.querySelector(\'button\');\\nbutton.addEventListener(\'click\', (ev) => {\\n    console.log(\'Click!\')\\n})\\n```\\n\\nNot too bad, but also not good:\\n\\n- There can be more than one button, so we need to add a ID or any other unique attribute to the button.\\n- This has to be careful wrapped in *another* event listener for `DOMContentLoaded` or `load`. Otherwise, the button _may not be there_ at all!.\\n\\n```html\\n<button id=\\"btn1\\">Click me</button>\\n```\\n\\n```js\\ndocument.addEventListener(\'DOMContentLoaded\', () => {\\n    const button = document.querySelector(\'#btn1\');\\n    button.addEventListener(\'click\', (ev) => {\\n        console.log(\'Click!\')\\n    })\\n})\\n```\\n\\nAgain, not to bad, but I wouldn\'t call this \\"awesome\\". From a development ergonomics point of view:\\n\\n- You have to keep two separate context in mind at the same time.\\n- This is the minimal code needed for one single event handler. No way around the \\"get element reference, then add event listener\\" two-step process.\\n\\nNow, compare that with JSX:\\n\\n```jsx\\n<button onclick={() => {console.log(\'Click\')}}>Click me</button>\\n```\\n\\nObviously _is not that simple_: This needs to be transpiled into actual JavaScript, loaded and rendered. And if we need to support SEO, it has to be SSR\'ed. But leave those things aside for a second, and focus on the JSX itself:\\n\\n- No need to switch context (and files) between HTML and JavaScript. It\'s all in the same place.\\n- Not manually having to get a reference to the DOM element.\\n- No need to guarantee that the DOM is loaded. Whoever implemented the underlying JSX rendering took care of that.\\n\\nI won\'t argue that this is the best solution to this ergonomics problem, but it is _a_ solution, and one that thousands of developers are already familiar with, for that matter.\\n\\n### More vanilla challenges: Sharing data between JavaScript and HTML\\n\\nI think one of the things that I disliked the most of pure vanilla JavaScript is around development ergonomics: There is just so much manual wiring needed to just make a button \\"clickable\\", wiring that is hard or just time consuming to abstract a way in a maintenable way.\\n\\nThe previous example could have been addressed by just bringing the old, reliable tools: Go JQuery on that button! \\n\\nBut, what if we want to write a button to greet our users?\\n\\n```html\\n<button id=\\"btn1\\">Say hi to John</button>\\n```\\n\\n```js\\ndocument.addEventListener(\'DOMContentLoaded\', () => {\\n    const button = document.querySelector(\'#btn1\');\\n    button.addEventListener(\'click\', (ev) => {\\n        console.log(\'Hi John!\')\\n    })\\n})\\n```\\n\\nIt\'s all good if `\\"John\\"` can be hardcoded. But, what if that comes from a database?\\n\\nNow the whole thing gets more complicated:\\n\\n```html\\n<button id=\\"btn1\\">Loading...</button>\\n```\\n\\n```js\\ndocument.addEventListener(\'DOMContentLoaded\', () => {\\n    const button = document.querySelector(\'#btn1\');\\n\\n   fetchUser().then(user => {\\n    button.textContent = `Say hi to ${user.firstName}`\\n        button.addEventListener(\'click\', (ev) => {\\n            console.log(`Hi ${user.firstName}`)\\n        })\\n   })\\n})\\n```\\n\\nUsers will only be able to click on this button _after_ the whole page loads and the user information is fetched. Before that, you only have a useless button.  JQuery itself cannot save us from this.\\n\\nOf course, this is only one approach. You could also:\\n\\n- Return the data on page load as an embedded stringified JSON and retrieve it using JavaScript, _then_ updating the button contents and the event listener.\\n  - We save ourselves a round-trip to the server, at the cost of having to manually store state somewhere in the page, being careful of avoiding naming collitions because this is now global state.\\n- Render _both_ HTML and JavaScript code on the server.\\n  - That could save us from having to show a \\"Loading...\\" message and have to update the button contents with JavaScript, but we get a new set of challenges:\\n    - The contents of the JavaScript file need to be dynamically rendered on the server. Writing tests for this would be a nightmare.\\n\\nNone of this solutions are impossible. In fact, we\'ve been doing this for decades in traditional server-driven web frameworks.\\n\\nBut let\'s just look again to JSX:\\n\\n```jsx\\nasync function GreeBtn() {\\n    const user = await fetchUser();\\n    return <button onclick={() => {\\n            console.log(`Hi! ${user.firstName}`)\\n        }}>\\n        Say hi to {user.firstName}\\n    </button>\\n}\\n```\\n\\nAgain, leaving implementation work aside, the development experience is very straightforward:\\n\\n- All code related to this piece of content is collocated.\\n- All rendering-related behavior is encapsulated in a single place, instead of being spread in multiple files\\n  - Granted, most of the time the code for the event handler wouldn\'t be fully inlined, but in JSX you can just define a function right above the JSX definition.\\n\\nBut we cannot ignore the implementation work anymore, nor the concerns many developers have regarding React Server Components (to which this last JSX example is extremely similar):\\n\\n- React client components cannot be _async_.\\n- React server components are still working on defining better boundaries between which components run in the server versus which run on the client, to avoid confusions or leaking sensitive information from the server into the client.\\n- At the end, this is pure JavaScript, which needs to be SSR\'d, loaded from a bundle on the client and re-hydrated, all before the button can be useful.\\n\\nIt would be awesome if we could just write this piece of JSX, have it rendered once directly as HTML and get all JavaScript just for the event handling wiring for free. Here is where a make my case for LeanJSX.\\n\\n## LeanJSX in the middle land\\n\\nIn LeanJSX, the last example of JSX we just saw is a valid component. Also the following example is valid:\\n\\n```jsx\\nasync function* GreeBtn() {\\n    // render something while we wait:\\n    yield (<>Loading</>)\\n\\n    const user = await fetchUser();\\n    return <button onclick={() => {\\n            console.log(`Hi! ${user.firstName}`)\\n        }}>\\n        Say hi to {user.firstName}\\n    </button>\\n}\\n```\\n\\nLeanJSX will take this compoenent and translate it into pure HTML and a bit of vanilla JavaScript, which then -with the power of [chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) will be streamed and rendered in the browser piece-by-piece:\\n\\n```html\\n<div data-placeholder=\\"element-0\\">Loading</div>\\n\\n<template id=\\"element-0\\">\\n    <<button data-action=\\"element-1\\">Say hi to John</button>\\n    <script>\\n        (function(){\\n        document.querySelector(\'[data-action=\\"element-1\\"]\').addEventListener(\'click\', () => alert(`Hi! John`))\\n        }).call({})\\n    <\/script>\\n</template>\\n<script>\\n    sxl.fillPlaceHolder(\\"element-0\\");  \\n<\/script>\\n```\\n\\nLooks a bit convulated, but in practice this is what happens:\\n\\n- A placeholder element containing `Loading` will be rendered in the browser.\\n- Once the user information is fully fetched, a `<template>` element is sent to the browser, along with inlined JavaScript code which will:\\n  - Replace the loading placeholder with the actual button contents.\\n  - Create the event handler for the `onclick` event, passing the correct handler to it.\\n\\nI know, you may have taken a step back in horror after seeing those inlined `<script>` tags. But there is a good reasong behind that: The button will be rendered and interactive _before_ the page or any other JavaScript bundle finishes loading. No need to wait for a `DOMContentLoaded` event.\\n\\nWait, but `sxl.fillPlaceHolder` needs to come from somewhere, right?\\n\\nThat is correct. LeanJSX _does_ include one single JavaScript file at the top of the document. You can see the pre-minified contents of that file [here](https://github.com/lean-web/lean-jsx/blob/main/src/web/wiring.ts).\\n\\nIt\'s a minimal-sized file which, adding GZIP and cache in top of it, has an almost neglectible impact on the page. the size for this script also remaing constant regardless of the number of components in your application.\\n\\nAs long as you\'re careful of not passing tons of code to your event handlers, that blocking, inline JavaScript code will be pure goodness.\\n\\n### Finally: The use case for LeanJSX\\n\\nLeanJSX is not a framework. It\'s basically a rendering engine for the server that uses JSX and defines a set of conventions on how to build web UIs; these conventions are based in how we currently build React applications.\\n\\n**I built LeanJSX for all those cases when _\\"you don\'t need a framework\\"_ but you still want to build server-driven web applications in a modular, component-based approach.**\\n\\nIt\'s like writing React applications, but using vanilla JavaScript and plain HTML under the hood.\\n\\nFor a better insight on the use cases and limitations of LeanJSX, take a look at [our docs](/docs/architecture/use-cases).\\n\\nThere you can also find an in-dept explanation of how LeanJSX works under the hood, and how it handles some of the challenges of building modern web applications."},{"id":"the-case-for-leanjsx-p1","metadata":{"permalink":"/lean-jsx/blog/the-case-for-leanjsx-p1","source":"@site/blog/2023-11-01-the-need-for-leanjsx.md","title":"The case for LeanJSX (part 1)","description":"Now that the first Alpha relase for LeanJSX is out, I wanted to share with y\'all some background about the project.","date":"2023-11-01T00:00:00.000Z","formattedDate":"November 1, 2023","tags":[{"label":"leanjsx","permalink":"/lean-jsx/blog/tags/leanjsx"},{"label":"release","permalink":"/lean-jsx/blog/tags/release"},{"label":"alpha","permalink":"/lean-jsx/blog/tags/alpha"}],"readingTime":4.135,"hasTruncateMarker":false,"authors":[{"name":"Pedro Marquez Soto","title":"Creator of LeanJSX","url":"https://github.com/pfernandom","imageURL":"https://github.com/pfernandom.png","key":"pfernandom"}],"frontMatter":{"slug":"the-case-for-leanjsx-p1","title":"The case for LeanJSX (part 1)","authors":"pfernandom","tags":["leanjsx","release","alpha"]},"prevItem":{"title":"The case for LeanJSX (part 2)","permalink":"/lean-jsx/blog/the-case-for-leanjsx-p2"},"nextItem":{"title":"Alpha release is out!","permalink":"/lean-jsx/blog/alpha-is-out"}},"content":"Now that the first Alpha relase for LeanJSX is out, I wanted to share with y\'all some background about the project.\\n\\nFor this, I have written two blog posts:\\n\\n- A quick look back into the state of web development\\n- Where LeanJSX fits in that history\\n\\n> TLDR; Server-rendered web applications were not great in the past, which is why we ended up having JavaScript frameworks like Angular and React.\\n> This is may not the case anymore (at least not for *all* projects), which is why it\'s a great time for something like LeanJSX.\\n\\n## The case for (and against) web frameworks\\n\\nMore than once I\'ve heard the words that many senior web developers like to repeat at the height of [JavaScript fatigue](https://auth0.com/blog/how-to-manage-javascript-fatigue/):\\n\\n> _\\"There is a high change that your application don\'t need a framework\\"_\\n\\nI fully agree with that thought. After years working with different JavaScript frameworks, from their humble beginnings with JQuery all the way to the latest React/Server Components trend, I can see how we have gradually pushed ourselves into the realms of over-engineering.\\n\\nAnd don\'t get me wrong, I love working with JavaScript frameworks and all the latest tooling that come with them. I really enjoy working with things like TypeScript and bundlers -things that now come as part of these tools by default-, and being able to build full web applications without having to start an API server.\\n\\nHowever, I also recognize that, as powerful as they are, these tools don\'t come for free. Adopting them has a cost in development effort, maintenance and above all, performance. Many applications have requirements for which these are valid trade-offs, but being honest, most of the time this is not the case.\\n\\n## To SPAs and back\\n\\nIt\'s been more than 13 years ago that AngularJS started making the rounds in web development. Back then, building complex web applications -things beyond simple blogs and personal websites- was a task that was tightly coupled with the backend and strongly divided in two parts:\\n\\n- Write templates in the server-side (PHP, JSPs, etc).\\n- Write JavaScript independently for UI widgets and content (JQuery, ExtJS, Mootools, etc).\\n\\nYou could write each independently, but you couldn\'t test and execute each in isolation. I spent months maintaining a static copy of the web application just so I could work on the JavaScript side faster.\\n\\nAngularJS didn\'t do much to change that, but introduced patterns that were relatively new for web development: Dependency injection, mocking, unit testing, etc; things that you needed to implement yourself before if you wanted them in your web code -which seldom happened-. For many people, including me, that started a revolution on how to build web applications.\\n\\nFast forward to 2023, and now you have web developers who not only have never had to build a backend-only server, but who have never worked with pure HTML/JS/CSS. I don\'t mention this as a critic, but only to outline how far we\'ve gotten with web-development tooling alone.\\n\\nBut now, things like React Server Components and SSR -in an effort to fix SEO problems and improve performance- are moving us back to those old days of server-rendered web content.\\n\\nHaving gone almost full-circle, it is a good moment to stop and see were we\'re standing.\\n\\n## The \\"reinvention\\" of server-rendered content\\n\\nSPAs were created in an effort to create performant web applications. Server-rendered, multi-page applications (MPAs) were looked down as being bad for performance, and most of the time they were; not because they were inherently bad but due many reasons:\\n\\n- The increasing need for better looking, more dynamic web applications.\\n- Browsers and servers were ill prepared for dynamic applications. Moving logic to JavaScript was basically a hack to work around the lack of support of traditional web development tooling for increasingly complex web applications.\\n- The lack of maturity of supporting infrastructure. Databases and other services were not as optimied for web traffic as they are today.\\n\\nI try to mention this things without over-generalizing, as obviously this wasn\'t the case for _all_ tools, servers and applications. But we cannot deny that JavaScript-driven applications came to fill a whole MPA shaped.\\n\\nThese things are not true anymore. In fact, the most common performance challenges in web applications come around network latency -a challenge made even more common due the extended usage of mobile devices-, and increasing bundle sizes.\\n\\nThe major reason driving the re-adoption of server-rendered component is exactly network latency:\\n\\n- Requests for data fetching done on the server tend to be faster than those performed on the users devices.\\n- Server-rendered content in many cases can mean reduced JavaScript bundles.\\n\\nA big telling that server-rendered content is not a huge bottleneck anymore is that we\'re starting to use it again to _improve performance_.\\n\\nIt is now a great moment to revisit our pre-conceptions about server-side web development and MPAs, which is in part what we will do in the next post."},{"id":"alpha-is-out","metadata":{"permalink":"/lean-jsx/blog/alpha-is-out","source":"@site/blog/2023-10-31-first-blog-post.md","title":"Alpha release is out!","description":"I\'m very excited to announce that the first relase for LeanJSX is out for everyone to try!","date":"2023-10-31T00:00:00.000Z","formattedDate":"October 31, 2023","tags":[{"label":"hola","permalink":"/lean-jsx/blog/tags/hola"},{"label":"leanjsx","permalink":"/lean-jsx/blog/tags/leanjsx"},{"label":"release","permalink":"/lean-jsx/blog/tags/release"},{"label":"alpha","permalink":"/lean-jsx/blog/tags/alpha"}],"readingTime":1.2,"hasTruncateMarker":false,"authors":[{"name":"Pedro Marquez Soto","title":"Creator of LeanJSX","url":"https://github.com/pfernandom","imageURL":"https://github.com/pfernandom.png","key":"pfernandom"}],"frontMatter":{"slug":"alpha-is-out","title":"Alpha release is out!","authors":"pfernandom","tags":["hola","leanjsx","release","alpha"]},"prevItem":{"title":"The case for LeanJSX (part 1)","permalink":"/lean-jsx/blog/the-case-for-leanjsx-p1"}},"content":"I\'m very excited to announce that the first relase for LeanJSX is out for everyone to try!\\n\\nMy plan for the first blog post for the project was to give some background on the reasons why I chose to build and publish LeanJSX publicly.\\n\\nBut before going into nicer topics, first things first:\\n\\n## Alpha Release Notice \ud83d\ude80\\n\\nWe\'re thrilled you\'re considering using LeanJSX for your next project! Please note that this framework is currently in an Alpha stage. While we\'ve worked hard to provide a robust and feature-rich experience, you may encounter unexpected behavior or missing features.\\n\\n## \ud83d\udee0 What this means for you\\n\\nThe API may undergo changes; updates might require you to adjust your code.\\nWhile we have some testing in place, edge cases can occur, and performance may not be fully optimized for all use cases.\\n\\n## \ud83c\udf1f Why try it anyway?\\n\\nBe among the first to adopt new (yet hopefully familiar) server-driven rendering techniques!\\n\\nYour feedback at this stage is incredibly valuable for the project\'s maturity and could shape its future direction.\\nEngage with a community that\'s passionate about creating a lightweight yet powerful alternative to client-side frameworks.\\n\\nWe highly encourage you to experiment with LeanJSX and would love to hear your thoughts, suggestions, and any issues you may encounter. Your contributions at this stage are especially impactful.\\n\\nFor any comments or suggestions, feel free to open an issue in the main Github repo:\\n\\nhttps://github.com/lean-web/lean-jsx"}]}')}}]);