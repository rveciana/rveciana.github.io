import{S as s,i as t,s as n,e as o,j as a,k as e,c as r,a as l,m as c,n as f,d as u,f as i,o as h,D as g,x as p,u as m,v as d,t as v,g as $,b as y,h as j,w as b,G as w,r as x}from"../../chunks/vendor-f4f84e30.js";import{P}from"../../chunks/PostCard-4120333c.js";import"../../chunks/config-b3bde751.js";function k(s,t,n){const o=s.slice();return o[2]=t[n],o}function E(s){let t,n,v,$;return n=new P({props:{post:s[2]}}),{c(){t=o("li"),a(n.$$.fragment),v=e()},l(s){t=r(s,"LI",{});var o=l(t);c(n.$$.fragment,o),v=f(o),o.forEach(u)},m(s,o){i(s,t,o),h(n,t,null),g(t,v),$=!0},p(s,t){const o={};1&t&&(o.post=s[2]),n.$set(o)},i(s){$||(p(n.$$.fragment,s),$=!0)},o(s){m(n.$$.fragment,s),$=!1},d(s){s&&u(t),d(n)}}}function D(s){let t,n,a,c,h,d,P,D=s[0],I=[];for(let o=0;o<D.length;o+=1)I[o]=E(k(s,D,o));const L=s=>m(I[s],1,1,(()=>{I[s]=null}));return{c(){t=o("div"),n=o("h1"),a=v("Posts by category: "),c=v(s[1]),h=e(),d=o("ul");for(let s=0;s<I.length;s+=1)I[s].c();this.h()},l(o){t=r(o,"DIV",{class:!0});var e=l(t);n=r(e,"H1",{class:!0});var i=l(n);a=$(i,"Posts by category: "),c=$(i,s[1]),i.forEach(u),h=f(e),d=r(e,"UL",{class:!0});var g=l(d);for(let s=0;s<I.length;s+=1)I[s].l(g);g.forEach(u),e.forEach(u),this.h()},h(){y(n,"class","page-heading"),y(d,"class","post-list"),y(t,"class","home")},m(s,o){i(s,t,o),g(t,n),g(n,a),g(n,c),g(t,h),g(t,d);for(let t=0;t<I.length;t+=1)I[t].m(d,null);P=!0},p(s,[t]){if((!P||2&t)&&j(c,s[1]),1&t){let n;for(D=s[0],n=0;n<D.length;n+=1){const o=k(s,D,n);I[n]?(I[n].p(o,t),p(I[n],1)):(I[n]=E(o),I[n].c(),p(I[n],1),I[n].m(d,null))}for(x(),n=D.length;n<I.length;n+=1)L(n);b()}},i(s){if(!P){for(let s=0;s<D.length;s+=1)p(I[s]);P=!0}},o(s){I=I.filter(Boolean);for(let t=0;t<I.length;t+=1)m(I[t]);P=!1},d(s){s&&u(t),w(I,s)}}}var I=function(s,t,n,o){return new(n||(n=Promise))((function(a,e){function r(s){try{c(o.next(s))}catch(t){e(t)}}function l(s){try{c(o.throw(s))}catch(t){e(t)}}function c(s){var t;s.done?a(s.value):(t=s.value,t instanceof n?t:new n((function(s){s(t)}))).then(r,l)}c((o=o.apply(s,t||[])).next())}))};function L({page:s,fetch:t}){return I(this,void 0,void 0,(function*(){const n=yield t(`${s.params.slug}.json`);return{props:{posts:yield n.json(),slug:s.params.slug}}}))}function B(s,t,n){let{posts:o=[]}=t,{slug:a=""}=t;return s.$$set=s=>{"posts"in s&&n(0,o=s.posts),"slug"in s&&n(1,a=s.slug)},[o,a]}class C extends s{constructor(s){super(),t(this,s,B,D,n,{posts:0,slug:1})}}export{C as default,L as load};