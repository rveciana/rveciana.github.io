import{S as t,i as e,s as n,e as o,k as a,t as s,L as c,c as r,d as i,n as m,a as l,g as p,b as u,D as d,f as h,h as g,E as f}from"../../../../../chunks/vendor-f4f84e30.js";import{c as E}from"../../../../../chunks/config-b3bde751.js";function y(t){let e,n,y,v,x,w,T,b,A,M,D,I,S,G,L,j,H,k,$,P,R,U,C,O,V,q=t[0].title+"",z=new Date(t[0].date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+"",B=t[0].contents+"";return document.title=e="GeoExamples - "+t[0].title,{c(){n=o("meta"),y=o("meta"),x=o("meta"),T=o("meta"),A=o("meta"),M=o("meta"),D=o("meta"),S=o("meta"),G=o("meta"),j=a(),H=o("div"),k=o("header"),$=o("h1"),P=s(q),R=a(),U=o("p"),C=s(z),O=a(),V=o("article"),this.h()},l(t){const e=c('[data-svelte="svelte-w2s84v"]',document.head);n=r(e,"META",{name:!0,content:!0}),y=r(e,"META",{name:!0,content:!0}),x=r(e,"META",{name:!0,content:!0}),T=r(e,"META",{name:!0,content:!0}),A=r(e,"META",{property:!0,content:!0}),M=r(e,"META",{property:!0,content:!0}),D=r(e,"META",{property:!0,content:!0}),S=r(e,"META",{property:!0,content:!0}),G=r(e,"META",{property:!0,content:!0}),e.forEach(i),j=m(t),H=r(t,"DIV",{class:!0});var o=l(H);k=r(o,"HEADER",{class:!0});var a=l(k);$=r(a,"H1",{class:!0});var s=l($);P=p(s,q),s.forEach(i),R=m(a),U=r(a,"P",{class:!0});var u=l(U);C=p(u,z),u.forEach(i),a.forEach(i),O=m(o),V=r(o,"ARTICLE",{class:!0}),l(V).forEach(i),o.forEach(i),this.h()},h(){var e,o,a;u(n,"name","twitter:card"),u(n,"content","summary"),u(y,"name","twitter:title"),u(y,"content",v="GeoExamples - "+t[0].title),u(x,"name","twitter:description"),u(x,"content",w=null!=(e=t[0].contents.substring(0,20))?e:E.site.description),u(T,"name","twitter:image"),u(T,"content",b="https://geoexamples.com"+(null!=(o=t[0].thumbnail)?o:"/siteImage.png")),u(A,"property","og:url"),u(A,"content","https://geoexamples.com"),u(M,"property","og:type"),u(M,"content","website"),u(D,"property","og:title"),u(D,"content",I="GeoExamples - "+t[0].title),u(S,"property","og:description"),u(S,"content",E.site.description),u(G,"property","og:image"),u(G,"content",L="https://geoexamples.com"+(null!=(a=t[0].thumbnail)?a:"/siteImage.png")),u($,"class","post-title"),u(U,"class","post-meta"),u(k,"class","post-header"),u(V,"class","post-content"),u(H,"class","post")},m(t,e){d(document.head,n),d(document.head,y),d(document.head,x),d(document.head,T),d(document.head,A),d(document.head,M),d(document.head,D),d(document.head,S),d(document.head,G),h(t,j,e),h(t,H,e),d(H,k),d(k,$),d($,P),d(k,R),d(k,U),d(U,C),d(H,O),d(H,V),V.innerHTML=B},p(t,[n]){var o,a,s;1&n&&e!==(e="GeoExamples - "+t[0].title)&&(document.title=e),1&n&&v!==(v="GeoExamples - "+t[0].title)&&u(y,"content",v),1&n&&w!==(w=null!=(o=t[0].contents.substring(0,20))?o:E.site.description)&&u(x,"content",w),1&n&&b!==(b="https://geoexamples.com"+(null!=(a=t[0].thumbnail)?a:"/siteImage.png"))&&u(T,"content",b),1&n&&I!==(I="GeoExamples - "+t[0].title)&&u(D,"content",I),1&n&&L!==(L="https://geoexamples.com"+(null!=(s=t[0].thumbnail)?s:"/siteImage.png"))&&u(G,"content",L),1&n&&q!==(q=t[0].title+"")&&g(P,q),1&n&&z!==(z=new Date(t[0].date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+"")&&g(C,z),1&n&&B!==(B=t[0].contents+"")&&(V.innerHTML=B)},i:f,o:f,d(t){i(n),i(y),i(x),i(T),i(A),i(M),i(D),i(S),i(G),t&&i(j),t&&i(H)}}}var v=function(t,e,n,o){return new(n||(n=Promise))((function(a,s){function c(t){try{i(o.next(t))}catch(e){s(e)}}function r(t){try{i(o.throw(t))}catch(e){s(e)}}function i(t){var e;t.done?a(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(c,r)}i((o=o.apply(t,e||[])).next())}))};function x({page:t,fetch:e}){return v(this,void 0,void 0,(function*(){const n=yield e(`${t.params.slug}.json`);return{props:{post:yield n.json()}}}))}function w(t,e,n){let{post:o={title:"",contents:"",tags:[],date:(new Date).toISOString(),thumbnail:""}}=e;return t.$$set=t=>{"post"in t&&n(0,o=t.post)},[o]}class T extends t{constructor(t){super(),e(this,t,w,y,n,{post:0})}}export{T as default,x as load};
