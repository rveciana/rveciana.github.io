import{S as t,i as s,s as n,e as a,t as e,j as o,c,a as r,b as i,d as l,l as u,o as h,f as p,g as f,h as d,n as v}from"../chunks/vendor-aee76599.js";function E(t){let s,n,E,m,x,y,j=t[0].title+"",H=t[0].contents+"";return{c(){s=a("div"),n=a("header"),E=a("h1"),m=e(j),x=o(),y=a("article"),this.h()},l(t){s=c(t,"DIV",{class:!0});var a=r(s);n=c(a,"HEADER",{class:!0});var e=r(n);E=c(e,"H1",{class:!0});var o=r(E);m=i(o,j),o.forEach(l),e.forEach(l),x=u(a),y=c(a,"ARTICLE",{class:!0}),r(y).forEach(l),a.forEach(l),this.h()},h(){h(E,"class","post-title"),h(n,"class","post-header"),h(y,"class","post-content"),h(s,"class","post")},m(t,a){p(t,s,a),f(s,n),f(n,E),f(E,m),f(s,x),f(s,y),y.innerHTML=H},p(t,[s]){1&s&&j!==(j=t[0].title+"")&&d(m,j),1&s&&H!==(H=t[0].contents+"")&&(y.innerHTML=H)},i:v,o:v,d(t){t&&l(s)}}}var m=function(t,s,n,a){return new(n||(n=Promise))((function(e,o){function c(t){try{i(a.next(t))}catch(s){o(s)}}function r(t){try{i(a.throw(t))}catch(s){o(s)}}function i(t){var s;t.done?e(t.value):(s=t.value,s instanceof n?s:new n((function(t){t(s)}))).then(c,r)}i((a=a.apply(t,s||[])).next())}))};function x({page:t,fetch:s}){return m(this,void 0,void 0,(function*(){const n=yield s(`${t.params.slug}.json`);return{props:{post:yield n.json()}}}))}function y(t,s,n){let{post:a={title:"",contents:""}}=s;return t.$$set=t=>{"post"in t&&n(0,a=t.post)},[a]}export default class extends t{constructor(t){super(),s(this,t,y,E,n,{post:0})}}export{x as load};