"use strict";(self.webpackChunklean_jsx_docs=self.webpackChunklean_jsx_docs||[]).push([[9705],{876:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>y});var a=r(2784);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=a.createContext({}),u=function(e){var t=a.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},c="mdxType",h={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),c=u(r),f=n,y=c["".concat(s,".").concat(f)]||c[f]||h[f]||o;return r?a.createElement(y,l(l({ref:t},p),{},{components:r})):a.createElement(y,l({ref:t},p))}));function y(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=r.length,l=new Array(o);l[0]=f;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[c]="string"==typeof e?e:n,l[1]=i;for(var u=2;u<o;u++)l[u]=r[u];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},6511:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>h,frontMatter:()=>o,metadata:()=>i,toc:()=>u});var a=r(7896),n=(r(2784),r(876));const o={slug:"alpha-is-out",title:"Alpha release is out!",authors:"pfernandom",tags:["hola","leanjsx","release","alpha"]},l=void 0,i={permalink:"/lean-jsx/blog/alpha-is-out",source:"@site/blog/2023-10-31-first-blog-post.md",title:"Alpha release is out!",description:"I'm very excited to announce that the first relase for LeanJSX is out for everyone to try!",date:"2023-10-31T00:00:00.000Z",formattedDate:"October 31, 2023",tags:[{label:"hola",permalink:"/lean-jsx/blog/tags/hola"},{label:"leanjsx",permalink:"/lean-jsx/blog/tags/leanjsx"},{label:"release",permalink:"/lean-jsx/blog/tags/release"},{label:"alpha",permalink:"/lean-jsx/blog/tags/alpha"}],readingTime:1.2,hasTruncateMarker:!1,authors:[{name:"Pedro Marquez Soto",title:"Creator of LeanJSX",url:"https://github.com/pfernandom",imageURL:"https://github.com/pfernandom.png",key:"pfernandom"}],frontMatter:{slug:"alpha-is-out",title:"Alpha release is out!",authors:"pfernandom",tags:["hola","leanjsx","release","alpha"]},prevItem:{title:"The case for LeanJSX (part 1)",permalink:"/lean-jsx/blog/the-case-for-leanjsx-p1"}},s={authorsImageUrls:[void 0]},u=[{value:"Alpha Release Notice \ud83d\ude80",id:"alpha-release-notice-",level:2},{value:"\ud83d\udee0 What this means for you",id:"-what-this-means-for-you",level:2},{value:"\ud83c\udf1f Why try it anyway?",id:"-why-try-it-anyway",level:2}],p={toc:u},c="wrapper";function h(e){let{components:t,...r}=e;return(0,n.kt)(c,(0,a.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"I'm very excited to announce that the first relase for LeanJSX is out for everyone to try!"),(0,n.kt)("p",null,"My plan for the first blog post for the project was to give some background on the reasons why I chose to build and publish LeanJSX publicly."),(0,n.kt)("p",null,"But before going into nicer topics, first things first:"),(0,n.kt)("h2",{id:"alpha-release-notice-"},"Alpha Release Notice \ud83d\ude80"),(0,n.kt)("p",null,"We're thrilled you're considering using LeanJSX for your next project! Please note that this framework is currently in an Alpha stage. While we've worked hard to provide a robust and feature-rich experience, you may encounter unexpected behavior or missing features."),(0,n.kt)("h2",{id:"-what-this-means-for-you"},"\ud83d\udee0 What this means for you"),(0,n.kt)("p",null,"The API may undergo changes; updates might require you to adjust your code.\nWhile we have some testing in place, edge cases can occur, and performance may not be fully optimized for all use cases."),(0,n.kt)("h2",{id:"-why-try-it-anyway"},"\ud83c\udf1f Why try it anyway?"),(0,n.kt)("p",null,"Be among the first to adopt new (yet hopefully familiar) server-driven rendering techniques!"),(0,n.kt)("p",null,"Your feedback at this stage is incredibly valuable for the project's maturity and could shape its future direction.\nEngage with a community that's passionate about creating a lightweight yet powerful alternative to client-side frameworks."),(0,n.kt)("p",null,"We highly encourage you to experiment with LeanJSX and would love to hear your thoughts, suggestions, and any issues you may encounter. Your contributions at this stage are especially impactful."),(0,n.kt)("p",null,"For any comments or suggestions, feel free to open an issue in the main Github repo:"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"https://github.com/lean-web/lean-jsx"},"https://github.com/lean-web/lean-jsx")))}h.isMDXComponent=!0}}]);