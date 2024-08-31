/*! For license information please see script_images.js.LICENSE.txt */
(()=>{function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(){"use strict";e=function(){return n};var r,n={},o=Object.prototype,a=o.hasOwnProperty,c=Object.defineProperty||function(t,e,r){t[e]=r.value},i="function"==typeof Symbol?Symbol:{},u=i.iterator||"@@iterator",s=i.asyncIterator||"@@asyncIterator",l=i.toStringTag||"@@toStringTag";function p(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{p({},"")}catch(r){p=function(t,e,r){return t[e]=r}}function f(t,e,r,n){var o=e&&e.prototype instanceof x?e:x,a=Object.create(o.prototype),i=new _(n||[]);return c(a,"_invoke",{value:B(t,r,i)}),a}function h(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}n.wrap=f;var d="suspendedStart",y="suspendedYield",m="executing",v="completed",g={};function x(){}function b(){}function w(){}var E={};p(E,u,(function(){return this}));var k=Object.getPrototypeOf,L=k&&k(k(N([])));L&&L!==o&&a.call(L,u)&&(E=L);var T=w.prototype=x.prototype=Object.create(E);function I(t){["next","throw","return"].forEach((function(e){p(t,e,(function(t){return this._invoke(e,t)}))}))}function S(e,r){function n(o,c,i,u){var s=h(e[o],e,c);if("throw"!==s.type){var l=s.arg,p=l.value;return p&&"object"==t(p)&&a.call(p,"__await")?r.resolve(p.__await).then((function(t){n("next",t,i,u)}),(function(t){n("throw",t,i,u)})):r.resolve(p).then((function(t){l.value=t,i(l)}),(function(t){return n("throw",t,i,u)}))}u(s.arg)}var o;c(this,"_invoke",{value:function(t,e){function a(){return new r((function(r,o){n(t,e,r,o)}))}return o=o?o.then(a,a):a()}})}function B(t,e,n){var o=d;return function(a,c){if(o===m)throw Error("Generator is already running");if(o===v){if("throw"===a)throw c;return{value:r,done:!0}}for(n.method=a,n.arg=c;;){var i=n.delegate;if(i){var u=O(i,n);if(u){if(u===g)continue;return u}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===d)throw o=v,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=m;var s=h(t,e,n);if("normal"===s.type){if(o=n.done?v:y,s.arg===g)continue;return{value:s.arg,done:n.done}}"throw"===s.type&&(o=v,n.method="throw",n.arg=s.arg)}}}function O(t,e){var n=e.method,o=t.iterator[n];if(o===r)return e.delegate=null,"throw"===n&&t.iterator.return&&(e.method="return",e.arg=r,O(t,e),"throw"===e.method)||"return"!==n&&(e.method="throw",e.arg=new TypeError("The iterator does not provide a '"+n+"' method")),g;var a=h(o,t.iterator,e.arg);if("throw"===a.type)return e.method="throw",e.arg=a.arg,e.delegate=null,g;var c=a.arg;return c?c.done?(e[t.resultName]=c.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,g):c:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,g)}function j(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function P(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function _(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(j,this),this.reset(!0)}function N(e){if(e||""===e){var n=e[u];if(n)return n.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,c=function t(){for(;++o<e.length;)if(a.call(e,o))return t.value=e[o],t.done=!1,t;return t.value=r,t.done=!0,t};return c.next=c}}throw new TypeError(t(e)+" is not iterable")}return b.prototype=w,c(T,"constructor",{value:w,configurable:!0}),c(w,"constructor",{value:b,configurable:!0}),b.displayName=p(w,l,"GeneratorFunction"),n.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===b||"GeneratorFunction"===(e.displayName||e.name))},n.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,w):(t.__proto__=w,p(t,l,"GeneratorFunction")),t.prototype=Object.create(T),t},n.awrap=function(t){return{__await:t}},I(S.prototype),p(S.prototype,s,(function(){return this})),n.AsyncIterator=S,n.async=function(t,e,r,o,a){void 0===a&&(a=Promise);var c=new S(f(t,e,r,o),a);return n.isGeneratorFunction(e)?c:c.next().then((function(t){return t.done?t.value:c.next()}))},I(T),p(T,l,"Generator"),p(T,u,(function(){return this})),p(T,"toString",(function(){return"[object Generator]"})),n.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},n.values=N,_.prototype={constructor:_,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(P),!t)for(var e in this)"t"===e.charAt(0)&&a.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(n,o){return i.type="throw",i.arg=t,e.next=n,o&&(e.method="next",e.arg=r),!!o}for(var o=this.tryEntries.length-1;o>=0;--o){var c=this.tryEntries[o],i=c.completion;if("root"===c.tryLoc)return n("end");if(c.tryLoc<=this.prev){var u=a.call(c,"catchLoc"),s=a.call(c,"finallyLoc");if(u&&s){if(this.prev<c.catchLoc)return n(c.catchLoc,!0);if(this.prev<c.finallyLoc)return n(c.finallyLoc)}else if(u){if(this.prev<c.catchLoc)return n(c.catchLoc,!0)}else{if(!s)throw Error("try statement without catch or finally");if(this.prev<c.finallyLoc)return n(c.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&a.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var c=o?o.completion:{};return c.type=t,c.arg=e,o?(this.method="next",this.next=o.finallyLoc,g):this.complete(c)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),g},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),P(r),g}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;P(r)}return o}}throw Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:N(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),g}},n}function r(t,e,r,n,o,a,c){try{var i=t[a](c),u=i.value}catch(t){return void r(t)}i.done?e(u):Promise.resolve(u).then(n,o)}function n(t){return function(){var e=this,n=arguments;return new Promise((function(o,a){var c=t.apply(e,n);function i(t){r(c,o,a,i,u,"next",t)}function u(t){r(c,o,a,i,u,"throw",t)}i(void 0)}))}}var o="coasting glitzy tapering finished unmapped jot abide mop goldsmith protract shortly lash";function a(){return c.apply(this,arguments)}function c(){return(c=n(e().mark((function t(){var r,n;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,html2canvas(document.body);case 2:return r=t.sent,t.next=5,new Promise((function(t){return r.toBlob(t,"image/png")}));case 5:return n=t.sent,t.abrupt("return",n);case 7:case"end":return t.stop()}}),t)})))).apply(this,arguments)}function i(t,e){return u.apply(this,arguments)}function u(){return(u=n(e().mark((function t(r,n){var a,c,i,u,p,f,h;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return a=s(r),c=s("gpt-4"),i=s(n),u=s("500"),t.prev=6,t.next=9,fetch("/api/openai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:a,model:c,prompt:i,chatId:u})});case 9:return p=t.sent,t.next=12,p.json();case 12:f=t.sent,p.ok?(e=f.encryptedResponse,d=void 0,d=CryptoJS.AES.decrypt(e,o),h=d.toString(CryptoJS.enc.Utf8),document.getElementById("openaiResponse").innerHTML=function(t){return t.replace(/```(\w+)\n([\s\S]*?)```/g,(function(t,e,r,n){var o="code-".concat(n,"-").concat(Date.now());return'\n      <div class="code-block">\n        <pre><code id="'.concat(o,'" class="language-').concat(e,'">').concat(l(r),'</code></pre>\n        <button class="copy-button" data-target="').concat(o,'">Copy</button>\n      </div>\n    ')}))}(function(t){return t.replace(/(?:^|\n)({[\s\S]*?})(?:$|\n)/g,(function(t,e){var r;try{var n=JSON.parse(e);r=JSON.stringify(n,null,2)}catch(t){r=e}return'\n          <div class="json-block">\n            <pre><code>'.concat(l(r),'</code></pre>\n            <button class="copy-button" onclick="copyToClipboard(`').concat(l(r).replace(/`/g,"\\`"),'`)">Copy</button>\n          </div>\n        ')}))}(h))):document.getElementById("openaiResponse").innerText="Erreur : ".concat(f.error),t.next=20;break;case 16:t.prev=16,t.t0=t.catch(6),console.error("Erreur:",t.t0),document.getElementById("openaiResponse").innerText="Erreur de requête : ".concat(t.t0.message);case 20:return t.prev=20,document.getElementById("loading").style.display="none",t.finish(20);case 23:case"end":return t.stop()}var e,d}),t,null,[[6,16,20,23]])})))).apply(this,arguments)}function s(t){return CryptoJS.AES.encrypt(t,o).toString()}function l(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}document.getElementById("uploadButton").addEventListener("click",n(e().mark((function t(){var r,n,o,a,c,u;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(r=document.getElementById("apiKey").value,n=document.getElementById("imageInput").files[0],r&&n){t.next=5;break}return alert("Veuillez entrer votre API Key et sélectionner une image."),t.abrupt("return");case 5:return(o=new FormData).append("image",n),document.getElementById("loading").style.display="block",t.prev=8,t.next=11,fetch("/extract-text",{method:"POST",body:o});case 11:return a=t.sent,t.next=14,a.json();case 14:if(c=t.sent,!a.ok){t.next=22;break}return u=c.text,document.getElementById("extractedText").innerText="Texte extrait:\n".concat(u),t.next=20,i(r,u);case 20:t.next=23;break;case 22:document.getElementById("extractedText").innerText="Erreur : ".concat(c.error);case 23:t.next=29;break;case 25:t.prev=25,t.t0=t.catch(8),console.error("Erreur:",t.t0),document.getElementById("extractedText").innerText="Erreur de requête : ".concat(t.t0.message);case 29:return t.prev=29,document.getElementById("loading").style.display="none",t.finish(29);case 32:case"end":return t.stop()}}),t,null,[[8,25,29,32]])})))),document.getElementById("captureButton").addEventListener("click",n(e().mark((function t(){var r,n,o,c,u,s;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(r=document.getElementById("apiKey").value){t.next=4;break}return alert("Veuillez entrer votre API Key."),t.abrupt("return");case 4:return t.prev=4,t.next=7,a();case 7:return n=t.sent,(o=new FormData).append("image",n),document.getElementById("loading").style.display="block",t.next=13,fetch("/extract-text",{method:"POST",body:o});case 13:return c=t.sent,t.next=16,c.json();case 16:if(u=t.sent,!c.ok){t.next=24;break}return s=u.text,document.getElementById("extractedText").innerText="Texte extrait:\n".concat(s),t.next=22,i(r,s);case 22:t.next=25;break;case 24:document.getElementById("extractedText").innerText="Erreur : ".concat(u.error);case 25:t.next=31;break;case 27:t.prev=27,t.t0=t.catch(4),console.error("Erreur:",t.t0),document.getElementById("extractedText").innerText="Erreur de requête : ".concat(t.t0.message);case 31:return t.prev=31,document.getElementById("loading").style.display="none",t.finish(31);case 34:case"end":return t.stop()}}),t,null,[[4,27,31,34]])})))),document.getElementById("backButton").addEventListener("click",(function(){window.location.href="index.html"}))})();