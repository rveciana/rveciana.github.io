import{S as e,i as t,s as o,e as n,p as a,j as s,c as r,a as c,q as l,l as m,d as i,f as p,r as h,g as f,w as u,x as d,y as g,t as v,J as y,b as E,o as w,D as x,F as b,C as A}from"../chunks/vendor-aee76599.js";import{P as $}from"../chunks/PostCard-94d94500.js";import"../chunks/config-b3bde751.js";function I(e,t,o){const n=e.slice();return n[1]=t[o],n}function M(e){let t,o,v,y;return o=new $({props:{post:e[1]}}),{c(){t=n("li"),a(o.$$.fragment),v=s()},l(e){t=r(e,"LI",{});var n=c(t);l(o.$$.fragment,n),v=m(n),n.forEach(i)},m(e,n){p(e,t,n),h(o,t,null),f(t,v),y=!0},p(e,t){const n={};1&t&&(n.post=e[1]),o.$set(n)},i(e){y||(u(o.$$.fragment,e),y=!0)},o(e){d(o.$$.fragment,e),y=!1},d(e){e&&i(t),g(o)}}}function T(e){let t,o,a,l,h,g,$,T,j,P,k,R,S,G,V,C,D,H,L,O,q,B,F,J,U,z=e[0],K=[];for(let n=0;n<z.length;n+=1)K[n]=M(I(e,z,n));const N=e=>d(K[e],1,1,(()=>{K[e]=null}));return{c(){t=n("meta"),o=n("meta"),a=n("meta"),l=n("meta"),h=n("meta"),g=n("meta"),$=n("meta"),T=n("meta"),j=n("meta"),P=s(),k=n("div"),R=n("h1"),S=v("Posts"),G=s(),V=n("ul");for(let e=0;e<K.length;e+=1)K[e].c();C=s(),D=n("h2"),H=n("a"),L=v("Older posts"),O=s(),q=n("p"),B=v("subscribe "),F=n("a"),J=v("via RSS"),this.h()},l(e){const n=y('[data-svelte="svelte-1vmy445"]',document.head);t=r(n,"META",{name:!0,content:!0}),o=r(n,"META",{name:!0,content:!0}),a=r(n,"META",{name:!0,content:!0}),l=r(n,"META",{name:!0,content:!0}),h=r(n,"META",{property:!0,content:!0}),g=r(n,"META",{property:!0,content:!0}),$=r(n,"META",{property:!0,content:!0}),T=r(n,"META",{property:!0,content:!0}),j=r(n,"META",{property:!0,content:!0}),n.forEach(i),P=m(e),k=r(e,"DIV",{class:!0});var s=c(k);R=r(s,"H1",{class:!0});var p=c(R);S=E(p,"Posts"),p.forEach(i),G=m(s),V=r(s,"UL",{class:!0});var f=c(V);for(let t=0;t<K.length;t+=1)K[t].l(f);f.forEach(i),s.forEach(i),C=m(e),D=r(e,"H2",{});var u=c(D);H=r(u,"A",{href:!0});var d=c(H);L=E(d,"Older posts"),d.forEach(i),u.forEach(i),O=m(e),q=r(e,"P",{class:!0});var v=c(q);B=E(v,"subscribe "),F=r(v,"A",{href:!0});var w=c(F);J=E(w,"via RSS"),w.forEach(i),v.forEach(i),this.h()},h(){document.title="GeoExamples - Roger Veciana",w(t,"name","twitter:card"),w(t,"content","summary"),w(o,"name","twitter:title"),w(o,"content","GeoExamples - Roger Veciana"),w(a,"name","twitter:description"),w(a,"content","I am a software developer and meteorologist who likes mapping. I put here the things I learn on my free time."),w(l,"name","twitter:image"),w(l,"content","https://geoexamples.com/siteImage.png"),w(h,"property","og:url"),w(h,"content","https://geoexamples.com"),w(g,"property","og:type"),w(g,"content","website"),w($,"property","og:title"),w($,"content","GeoExamples - Roger Veciana"),w(T,"property","og:description"),w(T,"content","I am a software developer and meteorologist who likes mapping. I put here the things I learn on my free time."),w(j,"property","og:image"),w(j,"content","https://geoexamples.com/siteImage.png"),w(R,"class","page-heading"),w(V,"class","post-list"),w(k,"class","home"),w(H,"href","blog"),w(F,"href","http://feeds.feedburner.com/Geoexamples"),w(q,"class","rss-subscribe")},m(e,n){f(document.head,t),f(document.head,o),f(document.head,a),f(document.head,l),f(document.head,h),f(document.head,g),f(document.head,$),f(document.head,T),f(document.head,j),p(e,P,n),p(e,k,n),f(k,R),f(R,S),f(k,G),f(k,V);for(let t=0;t<K.length;t+=1)K[t].m(V,null);p(e,C,n),p(e,D,n),f(D,H),f(H,L),p(e,O,n),p(e,q,n),f(q,B),f(q,F),f(F,J),U=!0},p(e,[t]){if(1&t){let o;for(z=e[0],o=0;o<z.length;o+=1){const n=I(e,z,o);K[o]?(K[o].p(n,t),u(K[o],1)):(K[o]=M(n),K[o].c(),u(K[o],1),K[o].m(V,null))}for(A(),o=z.length;o<K.length;o+=1)N(o);x()}},i(e){if(!U){for(let e=0;e<z.length;e+=1)u(K[e]);U=!0}},o(e){K=K.filter(Boolean);for(let t=0;t<K.length;t+=1)d(K[t]);U=!1},d(e){i(t),i(o),i(a),i(l),i(h),i(g),i($),i(T),i(j),e&&i(P),e&&i(k),b(K,e),e&&i(C),e&&i(D),e&&i(O),e&&i(q)}}}var j=function(e,t,o,n){return new(o||(o=Promise))((function(a,s){function r(e){try{l(n.next(e))}catch(t){s(t)}}function c(e){try{l(n.throw(e))}catch(t){s(t)}}function l(e){var t;e.done?a(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(r,c)}l((n=n.apply(e,t||[])).next())}))};function P({fetch:e}){return j(this,void 0,void 0,(function*(){const t=yield e("summary.json");return{props:{posts:yield t.json()}}}))}function k(e,t,o){let{posts:n=[]}=t;return e.$$set=e=>{"posts"in e&&o(0,n=e.posts)},[n]}export default class extends e{constructor(e){super(),t(this,e,k,T,o,{posts:0})}}export{P as load};