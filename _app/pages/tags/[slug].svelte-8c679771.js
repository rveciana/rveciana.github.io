import{S as s,i as t,s as n,e as a,j as o,k as e,c as r,a as l,m as c,n as f,d as u,f as i,o as h,D as g,x as p,u as m,v as d,t as v,g as $,b as y,h as j,w as b,G as w,r as x}from"../../chunks/vendor-f4f84e30.js";import{P}from"../../chunks/PostCard-4120333c.js";import"../../chunks/config-b3bde751.js";function k(s,t,n){const a=s.slice();return a[2]=t[n],a}function E(s){let t,n,v,$;return n=new P({props:{post:s[2]}}),{c(){t=a("li"),o(n.$$.fragment),v=e()},l(s){t=r(s,"LI",{});var a=l(t);c(n.$$.fragment,a),v=f(a),a.forEach(u)},m(s,a){i(s,t,a),h(n,t,null),g(t,v),$=!0},p(s,t){const a={};1&t&&(a.post=s[2]),n.$set(a)},i(s){$||(p(n.$$.fragment,s),$=!0)},o(s){m(n.$$.fragment,s),$=!1},d(s){s&&u(t),d(n)}}}function D(s){let t,n,o,c,h,d,P,D=s[0],I=[];for(let a=0;a<D.length;a+=1)I[a]=E(k(s,D,a));const L=s=>m(I[s],1,1,(()=>{I[s]=null}));return{c(){t=a("div"),n=a("h1"),o=v("Posts by tag: "),c=v(s[1]),h=e(),d=a("ul");for(let s=0;s<I.length;s+=1)I[s].c();this.h()},l(a){t=r(a,"DIV",{class:!0});var e=l(t);n=r(e,"H1",{class:!0});var i=l(n);o=$(i,"Posts by tag: "),c=$(i,s[1]),i.forEach(u),h=f(e),d=r(e,"UL",{class:!0});var g=l(d);for(let s=0;s<I.length;s+=1)I[s].l(g);g.forEach(u),e.forEach(u),this.h()},h(){y(n,"class","page-heading"),y(d,"class","post-list"),y(t,"class","home")},m(s,a){i(s,t,a),g(t,n),g(n,o),g(n,c),g(t,h),g(t,d);for(let t=0;t<I.length;t+=1)I[t].m(d,null);P=!0},p(s,[t]){if((!P||2&t)&&j(c,s[1]),1&t){let n;for(D=s[0],n=0;n<D.length;n+=1){const a=k(s,D,n);I[n]?(I[n].p(a,t),p(I[n],1)):(I[n]=E(a),I[n].c(),p(I[n],1),I[n].m(d,null))}for(x(),n=D.length;n<I.length;n+=1)L(n);b()}},i(s){if(!P){for(let s=0;s<D.length;s+=1)p(I[s]);P=!0}},o(s){I=I.filter(Boolean);for(let t=0;t<I.length;t+=1)m(I[t]);P=!1},d(s){s&&u(t),w(I,s)}}}var I=function(s,t,n,a){return new(n||(n=Promise))((function(o,e){function r(s){try{c(a.next(s))}catch(t){e(t)}}function l(s){try{c(a.throw(s))}catch(t){e(t)}}function c(s){var t;s.done?o(s.value):(t=s.value,t instanceof n?t:new n((function(s){s(t)}))).then(r,l)}c((a=a.apply(s,t||[])).next())}))};function L({page:s,fetch:t}){return I(this,void 0,void 0,(function*(){const n=yield t(`${s.params.slug}.json`);return{props:{posts:yield n.json(),slug:s.params.slug}}}))}function B(s,t,n){let{posts:a=[]}=t,{slug:o=";"}=t;return s.$$set=s=>{"posts"in s&&n(0,a=s.posts),"slug"in s&&n(1,o=s.slug)},[a,o]}class C extends s{constructor(s){super(),t(this,s,B,D,n,{posts:0,slug:1})}}export{C as default,L as load};
