import{S as t,i as e,s as n,e as o,j as a,t as s,J as c,c as r,d as i,l as m,a as p,b as l,o as u,g as h,f as d,h as g,n as E}from"../../../../../chunks/vendor-aee76599.js";import{c as f}from"../../../../../chunks/config-b3bde751.js";function y(t){let e,n,y,v,x,T,w,A,M,b,D,I,S,G,j,L,H,$,k,P,R,U,C,J,O=t[0].title+"",V=new Date(t[0].date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+"",q=t[0].contents+"";return document.title=e="GeoExamples - "+t[0].title,{c(){n=o("meta"),y=o("meta"),x=o("meta"),T=o("meta"),A=o("meta"),M=o("meta"),b=o("meta"),I=o("meta"),S=o("meta"),j=a(),L=o("div"),H=o("header"),$=o("h1"),k=s(O),P=a(),R=o("p"),U=s(V),C=a(),J=o("article"),this.h()},l(t){const e=c('[data-svelte="svelte-4aysgi"]',document.head);n=r(e,"META",{name:!0,content:!0}),y=r(e,"META",{name:!0,content:!0}),x=r(e,"META",{name:!0,content:!0}),T=r(e,"META",{name:!0,content:!0}),A=r(e,"META",{property:!0,content:!0}),M=r(e,"META",{property:!0,content:!0}),b=r(e,"META",{property:!0,content:!0}),I=r(e,"META",{property:!0,content:!0}),S=r(e,"META",{property:!0,content:!0}),e.forEach(i),j=m(t),L=r(t,"DIV",{class:!0});var o=p(L);H=r(o,"HEADER",{class:!0});var a=p(H);$=r(a,"H1",{class:!0});var s=p($);k=l(s,O),s.forEach(i),P=m(a),R=r(a,"P",{class:!0});var u=p(R);U=l(u,V),u.forEach(i),a.forEach(i),C=m(o),J=r(o,"ARTICLE",{class:!0}),p(J).forEach(i),o.forEach(i),this.h()},h(){var e,o;u(n,"name","twitter:card"),u(n,"content","summary"),u(y,"name","twitter:title"),u(y,"content",v="GeoExamples - "+t[0].title),u(x,"name","twitter:description"),u(x,"content",f.site.description),u(T,"name","twitter:image"),u(T,"content",w="https://geoexamples.com"+(null!=(e=t[0].thumbnail)?e:"/siteImage.png")),u(A,"property","og:url"),u(A,"content","https://geoexamples.com"),u(M,"property","og:type"),u(M,"content","website"),u(b,"property","og:title"),u(b,"content",D="GeoExamples - "+t[0].title),u(I,"property","og:description"),u(I,"content",f.site.description),u(S,"property","og:image"),u(S,"content",G="https://geoexamples.com"+(null!=(o=t[0].thumbnail)?o:"/siteImage.png")),u($,"class","post-title"),u(R,"class","post-meta"),u(H,"class","post-header"),u(J,"class","post-content"),u(L,"class","post")},m(t,e){h(document.head,n),h(document.head,y),h(document.head,x),h(document.head,T),h(document.head,A),h(document.head,M),h(document.head,b),h(document.head,I),h(document.head,S),d(t,j,e),d(t,L,e),h(L,H),h(H,$),h($,k),h(H,P),h(H,R),h(R,U),h(L,C),h(L,J),J.innerHTML=q},p(t,[n]){var o,a;1&n&&e!==(e="GeoExamples - "+t[0].title)&&(document.title=e),1&n&&v!==(v="GeoExamples - "+t[0].title)&&u(y,"content",v),1&n&&w!==(w="https://geoexamples.com"+(null!=(o=t[0].thumbnail)?o:"/siteImage.png"))&&u(T,"content",w),1&n&&D!==(D="GeoExamples - "+t[0].title)&&u(b,"content",D),1&n&&G!==(G="https://geoexamples.com"+(null!=(a=t[0].thumbnail)?a:"/siteImage.png"))&&u(S,"content",G),1&n&&O!==(O=t[0].title+"")&&g(k,O),1&n&&V!==(V=new Date(t[0].date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+"")&&g(U,V),1&n&&q!==(q=t[0].contents+"")&&(J.innerHTML=q)},i:E,o:E,d(t){i(n),i(y),i(x),i(T),i(A),i(M),i(b),i(I),i(S),t&&i(j),t&&i(L)}}}var v=function(t,e,n,o){return new(n||(n=Promise))((function(a,s){function c(t){try{i(o.next(t))}catch(e){s(e)}}function r(t){try{i(o.throw(t))}catch(e){s(e)}}function i(t){var e;t.done?a(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(c,r)}i((o=o.apply(t,e||[])).next())}))};function x({page:t,fetch:e}){return v(this,void 0,void 0,(function*(){const n=yield e(`${t.params.slug}.json`);return{props:{post:yield n.json()}}}))}function T(t,e,n){let{post:o={title:"",contents:"",tags:[],date:(new Date).toISOString(),thumbnail:""}}=e;return t.$$set=t=>{"post"in t&&n(0,o=t.post)},[o]}export default class extends t{constructor(t){super(),e(this,t,T,y,n,{post:0})}}export{x as load};