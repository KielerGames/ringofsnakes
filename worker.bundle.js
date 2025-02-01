/*! For license information please see worker.bundle.js.LICENSE.txt */
(()=>{"use strict";const e=Symbol("Comlink.proxy"),t=Symbol("Comlink.endpoint"),n=Symbol("Comlink.releaseProxy"),s=Symbol("Comlink.finalizer"),a=Symbol("Comlink.thrown"),i=e=>"object"==typeof e&&null!==e||"function"==typeof e,r={canHandle:t=>i(t)&&t[e],serialize(e){const{port1:t,port2:n}=new MessageChannel;return c(e,t),[n,[n]]},deserialize:e=>(e.start(),function(e,t){const n=new Map;return e.addEventListener("message",(function(e){const{data:t}=e;if(!t||!t.id)return;const s=n.get(t.id);if(s)try{s(t)}finally{n.delete(t.id)}})),g(e,n,[],void 0)}(e))},o=new Map([["proxy",r],["throw",{canHandle:e=>i(e)&&a in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function c(t,n=globalThis,i=["*"]){n.addEventListener("message",(function r(o){if(!o||!o.data)return;if(!function(e,t){for(const n of e){if(t===n||"*"===n)return!0;if(n instanceof RegExp&&n.test(t))return!0}return!1}(i,o.origin))return void console.warn(`Invalid origin '${o.origin}' for comlink proxy`);const{id:u,type:d,path:l}=Object.assign({path:[]},o.data),f=(o.data.argumentList||[]).map(y);let g;try{const n=l.slice(0,-1).reduce(((e,t)=>e[t]),t),s=l.reduce(((e,t)=>e[t]),t);switch(d){case"GET":g=s;break;case"SET":n[l.slice(-1)[0]]=y(o.data.value),g=!0;break;case"APPLY":g=s.apply(n,f);break;case"CONSTRUCT":g=function(t){return Object.assign(t,{[e]:!0})}(new s(...f));break;case"ENDPOINT":{const{port1:e,port2:n}=new MessageChannel;c(t,n),g=k(e,[e])}break;case"RELEASE":g=void 0;break;default:return}}catch(e){g={value:e,[a]:0}}Promise.resolve(g).catch((e=>({value:e,[a]:0}))).then((e=>{const[a,i]=w(e);n.postMessage(Object.assign(Object.assign({},a),{id:u}),i),"RELEASE"===d&&(n.removeEventListener("message",r),h(n),s in t&&"function"==typeof t[s]&&t[s]())})).catch((e=>{const[t,s]=w({value:new TypeError("Unserializable return value"),[a]:0});n.postMessage(Object.assign(Object.assign({},t),{id:u}),s)}))})),n.start&&n.start()}function h(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function u(e){if(e)throw new Error("Proxy has been released and is not useable")}function d(e){return x(e,new Map,{type:"RELEASE"}).then((()=>{h(e)}))}const l=new WeakMap,f="FinalizationRegistry"in globalThis&&new FinalizationRegistry((e=>{const t=(l.get(e)||0)-1;l.set(e,t),0===t&&d(e)}));function g(e,s,a=[],i=function(){}){let r=!1;const o=new Proxy(i,{get(t,i){if(u(r),i===n)return()=>{!function(e){f&&f.unregister(e)}(o),d(e),s.clear(),r=!0};if("then"===i){if(0===a.length)return{then:()=>o};const t=x(e,s,{type:"GET",path:a.map((e=>e.toString()))}).then(y);return t.then.bind(t)}return g(e,s,[...a,i])},set(t,n,i){u(r);const[o,c]=w(i);return x(e,s,{type:"SET",path:[...a,n].map((e=>e.toString())),value:o},c).then(y)},apply(n,i,o){u(r);const c=a[a.length-1];if(c===t)return x(e,s,{type:"ENDPOINT"}).then(y);if("bind"===c)return g(e,s,a.slice(0,-1));const[h,d]=m(o);return x(e,s,{type:"APPLY",path:a.map((e=>e.toString())),argumentList:h},d).then(y)},construct(t,n){u(r);const[i,o]=m(n);return x(e,s,{type:"CONSTRUCT",path:a.map((e=>e.toString())),argumentList:i},o).then(y)}});return function(e,t){const n=(l.get(t)||0)+1;l.set(t,n),f&&f.register(e,t,e)}(o,e),o}function m(e){const t=e.map(w);return[t.map((e=>e[0])),(n=t.map((e=>e[1])),Array.prototype.concat.apply([],n))];var n}const p=new WeakMap;function k(e,t){return p.set(e,t),e}function w(e){for(const[t,n]of o)if(n.canHandle(e)){const[s,a]=n.serialize(e);return[{type:"HANDLER",name:t,value:s},a]}return[{type:"RAW",value:e},p.get(e)||[]]}function y(e){switch(e.type){case"HANDLER":return o.get(e.name).deserialize(e.value);case"RAW":return e.value}}function x(e,t,n,s){return new Promise((a=>{const i=new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join("-");t.set(i,a),e.start&&e.start(),e.postMessage(Object.assign({id:i},n),s)}))}const b=()=>{};class E{#e;onclose=b;onJSONMessage=b;onBinaryMessage=b;constructor(e){this.#e=e,this.#e.onclose=e=>{const{code:t,reason:n,wasClean:s}=e;console.info("WebSocket closed",t,n,s),this.onclose()},this.#e.onerror=()=>console.error("WebSocket error"),this.#e.onmessage=e=>{const t=e.data;if(t instanceof ArrayBuffer)this.onBinaryMessage(t);else{const e=JSON.parse(t);this.onJSONMessage(e)}}}sendJSON(e){this.#e.send(JSON.stringify(e))}sendBinary(e){this.#e.send(e)}close(){this.#e.readyState!==WebSocket.CLOSED&&this.#e.close()}isOpen(){return this.#e.readyState===WebSocket.OPEN}}function S(e,t,n){const s=new DataView(e,t,26),a=s.getUint8(5),i=(8,r=e=>0!=(a&1<<e),Array.from({length:8},((e,t)=>r(t))));var r;const o=s.getFloat32(6,!1),c=s.getFloat32(10,!1),h=s.getFloat32(14,!1);return{data:{id:s.getUint16(0,!1),headChunkId:s.getUint32(0,!1),skin:s.getUint8(4),fast:i[0],fastHistory:i,length:o,width:v(o,n),headDirection:[c,h],headPosition:{x:s.getFloat32(18,!1),y:s.getFloat32(22,!1)}},nextByteOffset:t+26}}function v(e,t){const n=t.snakes.minWidth,s=t.snakes.maxWidth-t.snakes.minWidth;var a;return n+2*(a=(e-t.snakes.minLength)/(1024-t.snakes.minLength)*3.66,1/(1+Math.exp(-a))-.5)*s}function U(e){if(!Number.isFinite(e))return 0;for(;Math.abs(e)>Math.PI;)e-=2*Math.sign(e)*Math.PI;return e}Math.PI;class M{minX;maxX;minY;maxY;constructor(e,t,n,s){this.minX=e,this.maxX=t,this.minY=n,this.maxY=s}static fromTransferable(e){return new M(e.minX,e.maxX,e.minY,e.maxY)}static createAt(e,t,n){const s=.5*t,a=.5*n;return new M(e.x-s,e.x+s,e.y-a,e.y+a)}static distance2(e,t){let n=0,s=0;return e.maxX<t.minX?n=t.minX-e.maxX:t.maxX<e.minX&&(n=e.minX-t.maxX),e.maxY<t.minY?s=t.minY-e.maxY:t.maxY<e.minY&&(s=e.minY-t.maxY),n*n+s*s}get width(){return this.maxX-this.minX}get height(){return this.maxY-this.minY}createTransferable(e=0){return{minX:this.minX-e,maxX:this.maxX+e,minY:this.minY-e,maxY:this.maxY+e}}extendTo(e,t=Number.EPSILON){return new M(Math.min(this.minX,e.x-t),Math.max(this.maxX,e.x+t),Math.min(this.minY,e.y-t),Math.max(this.maxY,e.y+t))}contains(e){const t=this.minX<=e.x&&e.x<this.maxX,n=this.minY<=e.y&&e.y<this.maxY;return t&&n}}class C{vertices;buffer;#t;#n;#s=0;constructor(e,t){this.#t=e,this.vertices=2*this.#t,this.#n=t,this.buffer=new Float32Array(6*this.vertices)}addPoint(e,t,n,s){this.#a();const a=this.buffer;let i=this.#s;this.#s+=12;const r=n-.5*Math.PI,o=Math.cos(r),c=Math.sin(r),h=this.#n-s;a[i+0]=e,a[i+1]=t,a[i+2]=o,a[i+3]=c,a[i+4]=1,a[i+5]=h,i+=6,a[i+0]=e,a[i+1]=t,a[i+2]=o,a[i+3]=c,a[i+4]=-1,a[i+5]=h}duplicateLastPoint(){this.#a();const e=this.#s,t=e-12;if(t<0)throw new Error("No point to duplicate.");this.#s+=12;const n=this.buffer;for(let s=0;s<12;s++)n[e+s]=n[t+s]}#a(){if(this.#s>=this.buffer.length)throw new RangeError("Cannot add another point to vertex buffer.")}}function L(e,t,n){const s=new DataView(e,t);if(s.byteLength<21)throw new RangeError("Invalid buffer (too small for header)");const a=s.getUint16(0,!1),i=s.getUint32(0,!1),r=s.getUint8(4);let o=s.getFloat32(5,!1),c=s.getFloat32(9,!1),h=s.getFloat32(13,!1);const u=s.getFloat32(17,!1),d=21+r===96;if(!d&&0!==u)throw new Error(`Invalid chunk offset value: ${u}`);if(s.byteLength<21+r)throw new RangeError("Invalid buffer (too small)");const l=r+1,f=new Float32Array(4*l);let g,m,p,k,w=0;g=m=c,p=k=h,f[0]=c,f[1]=h,f[2]=w,f[3]=o;for(let e=0;e<r;e++){const t=s.getUint8(21+e),a=(128&t)>0,i=1+((112&t)>>4),r=I(n,15&t),u=o+.5*r;o=U(o+r);const d=i*(a?n.snakes.fastSpeed:n.snakes.speed);c+=d*Math.cos(o),h+=d*Math.sin(o),w+=d;const l=4*(e+1);f[l+0]=c,f[l+1]=h,f[l+2]=w,f[l+3]=u,g=Math.min(g,c),m=Math.max(m,c),p=Math.min(p,h),k=Math.max(k,h)}f[f.length-1]=o,w=Math.max(w,f[f.length-2]);const y=new C(l+1,w);for(let e=0;e<l;e++){const t=4*e;y.addPoint(f[t+0],f[t+1],f[t+3],f[t+2])}y.duplicateLastPoint();const x=new M(g,m,p,k);return{data:{id:i,snakeId:a,length:w,offset:u,full:d,vertices:y.vertices,data:y.buffer,boundingBox:x.createTransferable()},nextByteOffset:t+21+r}}function I(e,t){return(1-((1&t)<<1))*Math.floor(t/2)*e.snakes.maxTurnDelta/7}const N=Math.pow(2,53),T=65535,[P,O,A]=[5,57068,58989],B=[.64,1,1.5],D=2*Float32Array.BYTES_PER_ELEMENT+3*Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT+Int32Array.BYTES_PER_ELEMENT,F=new class{#i;#r;#o;constructor(e){void 0===e&&(e=Math.floor(281474976710656*Math.random())),this.setSeed(e)}nextBoolean(){return 0!=this.#c(1)}nextFloat(){return this.#c(24)/16777216}nextDouble(){return(134217728*this.#c(26)+this.#c(27))/N}#h(){let e=11,t=this.#i*A+e;e=t>>>16,t&=T;let n=this.#r*A+this.#i*O+e;e=n>>>16,n&=T;let s=this.#o*A+this.#r*O+this.#i*P+e;return s&=T,[this.#o,this.#r,this.#i]=[s,n,t],65536*this.#o+this.#r}#c(e){return this.#h()>>>32-e}setSeed(e){this.#u(e),this.#i=e&T^A,this.#r=e/65536&T^O,this.#o=e/4294967296&T^P}#u(e,t=Number.MAX_SAFE_INTEGER){if(e<0||e>t)throw RangeError()}};function Y(e,t,n){const s=new DataView(e,t),a=n.chunks.size,i=s.getUint16(2,!1),r=s.getUint16(0,!1),o=s.getUint8(0),c=s.getUint8(1),h=(o-.5*n.chunks.columns)*a,u=(c-.5*n.chunks.rows)*a,d=new ArrayBuffer(i*D),l=new DataView(d);for(let e=0;e<i;e++){const t=4+3*e,n=s.getInt8(t+0)+128,i=s.getInt8(t+1)+128,r=s.getUint8(t+2),o=B[r>>6],c=63&r,d=h+n/256*a,f=u+i/256*a;F.setSeed(s.getUint16(t)<<8|r);const g=e*D;l.setFloat32(g+0,d,!0),l.setFloat32(g+4,f,!0),l.setFloat32(g+8,X(),!0),l.setFloat32(g+12,X(),!0),l.setFloat32(g+16,X(),!0),l.setFloat32(g+20,o,!0),l.setInt32(g+24,c%7,!0)}return{data:{id:r,vertexBuffer:d,count:i,bounds:{minX:h,maxX:h+a,minY:u,maxY:u+a}},nextByteOffset:t+4+3*i}}function X(){const e=F.nextBoolean()?1:-1,t=F.nextFloat();return e*(.75+.85*t*t)}function R(e,t,n,s,a){const i=new Array(n);for(let r=0;r<n;r++){const{data:n,nextByteOffset:o}=e(s,a,t);i[r]=n,a=o}return{data:i,nextByteOffset:a}}class Q{#d=new Set;#l=!1;addListener(e){this.#l||this.#d.add(e)}trigger(e){this.#d.forEach((t=>t(e)))}done(){this.#d.clear(),this.#l=!0}}let z=null;const V=new class{#f;#g=performance.now();#m=null;#p=void 0;#k;constructor(e,t){this.#f=e,this.#k=t}setValue(e){if(void 0!==this.#p)return void(this.#m=e);const t=performance.now(),n=t-this.#g;if(n>=this.#f)return this.#g=t,void this.#k(e);const s=this.#f-n;this.#p=setTimeout((()=>{this.#p=void 0,null!==this.#m&&(this.#k(this.#m),this.#m=null)}),s)}abort(){void 0!==this.#p&&(clearTimeout(this.#p),this.#p=void 0)}}(1e3/30,(e=>{if(z&&z.isOpen()){const t=new ArrayBuffer(9),n=new DataView(t),s=M.fromTransferable(e.viewBox);n.setFloat32(0,s.width/s.height,!1),n.setFloat32(4,e.targetAlpha,!1),n.setUint8(8,e.wantsToBeFast?1:0),z.sendBinary(t)}})),W={serverUpdate:new Q,error:new Q,disconnect:new Q,spectatorChange:new Q},_=new class{config;#w=[];#y=new Map;#x;constructor(e){this.#x=e}init(e){this.config=e.gameConfig,e.snakeName&&this.#y.set(e.snakeId,e.snakeName)}nextUpdate(){const e=this.#w.shift(),t=this.#w.length>0;return e&&e.snakes.forEach((e=>e.name=this.#y.get(e.id))),{ticksSinceLastUpdate:0,snakes:[],snakeChunks:[],foodChunks:[],snakeDeaths:[],...e,moreUpdates:t}}addBinaryUpdate(e){const t=function(e,t){const n=new DataView(t),s=n.getUint8(0),a=n.getUint8(1),i=n.getUint8(2),r=n.getUint8(3),o=0!==n.getUint8(4),{data:c,nextByteOffset:h}=R(S,e,a,t,5),{data:u,nextByteOffset:d}=R(L,e,i,t,h),{data:l,nextByteOffset:f}=R(Y,e,r,t,d);let g,m=f;if(o){const n=e.chunks.rows*e.chunks.columns;m+=n;const s=new Uint8Array(t,f,n);g=new Uint8Array(s)}return m!==t.byteLength&&console.error(`Unexpected update buffer size (expected ${m}, was ${t.byteLength})`),{ticksSinceLastUpdate:s,snakeInfos:c,snakeChunkData:u,foodChunkData:l,heatMap:g}}(this.config,e);t.ticksSinceLastUpdate<=0&&console.error(`Binary update not supported! ticks: ${t.ticksSinceLastUpdate}`);const n=this.#w.length>0&&0===this.#w[this.#w.length-1].ticksSinceLastUpdate,s=n?this.#w[this.#w.length-1]:{ticksSinceLastUpdate:0,snakes:[],snakeChunks:[],foodChunks:[],snakeDeaths:[]};s.ticksSinceLastUpdate=t.ticksSinceLastUpdate,s.snakes.push(...t.snakeInfos),s.snakeChunks.push(...t.snakeChunkData),s.foodChunks.push(...t.foodChunkData),t.heatMap&&(s.heatMap=t.heatMap),n||this.#w.push(s),this.duration>.5&&console.warn(`Update congestion! Current delay: ${this.duration.toFixed(2)}s`),this.#b()}addJSONUpdate(e){switch(e.tag){case"SnakeDeathInfo":console.info(`Snake ${e.deadSnakeId} has died.`),this.#E({snakeDeaths:[{deadSnakeId:e.deadSnakeId,killer:void 0!==e.killerSnakeId?{snakeId:e.killerSnakeId,name:this.#S(e.killerSnakeId)}:void 0}]}),this.#y.delete(e.deadSnakeId),this.#b();break;case"GameStatistics":this.#E({leaderboard:(({tag:e,...t})=>t)(e)}),e.leaderboard.forEach((({id:e,name:t})=>this.#y.set(e,t))),this.#b();break;case"SnakeNameUpdate":for(const[t,n]of Object.entries(e.names)){const e=parseInt(t,10);this.#y.set(e,n)}break;default:throw new Error(`Unexpected message from server. (tag = ${e.tag})`)}}get duration(){return this.config.tickDuration*this.#w.map((e=>e.ticksSinceLastUpdate)).reduce(((e,t)=>e+t),0)}#E(e){let t;0===this.#w.length?(t={ticksSinceLastUpdate:0,snakes:[],snakeChunks:[],foodChunks:[],snakeDeaths:[]},this.#w.push(t)):t=this.#w[this.#w.length-1],e.leaderboard&&(t.leaderboard=e.leaderboard),e.snakeDeaths&&t.snakeDeaths.push(...e.snakeDeaths)}#b(){this.#x&&this.#x()}#S(e){return this.#y.get(e)??`Snake ${e}`}}((function(){W.serverUpdate.trigger()})),j={async init(e){if(null!==z)throw new Error("Worker is already initialized.");console.info(`Connecting to ${e}`),z=await async function(e){const t=new WebSocket(e);return t.binaryType="arraybuffer",await new Promise(((e,n)=>{t.onopen=()=>{t.onopen=null,e()},t.onerror=()=>{t.onerror=null,n()}})),new E(t)}(e);const t=await new Promise(((e,t)=>{const n=setTimeout((()=>t(new Error("GameInfo timeout."))),1500);z.onJSONMessage=t=>{"GameInfo"===t.tag?(clearTimeout(n),e(t)):console.warn("Game init: Unexpected message from server.",t)}}));return _.init(t),z.onJSONMessage=e=>{"SpectatorChange"===e.tag?W.spectatorChange.trigger(e):_.addJSONUpdate(e)},z.onBinaryMessage=e=>{_.addBinaryUpdate(e)},z.onclose=()=>{W.disconnect.trigger(),self.close()},{config:_.config,targetSnakeId:t.snakeId,startPosition:t.startPosition}},sendUserInput(e,t,n){V.setValue({targetAlpha:e,wantsToBeFast:t,viewBox:n})},getDataChanges(){const e=_.nextUpdate(),t=[...e.snakeChunks.map((e=>e.data.buffer)),...e.foodChunks.map((e=>e.vertexBuffer))];return e.heatMap&&t.push(e.heatMap.buffer),k(e,t)},quit(){z&&z.close(),self.close()},addEventListener(e,t){W[e].addListener(t)},onError(e){W.error.addListener(e)},onSpectatorChange(e){W.spectatorChange.addListener(e)}};self.onerror=(e,t,n,s,a)=>{W.error.trigger(e.toString())},c(j)})();