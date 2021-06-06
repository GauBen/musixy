!function(){function t(t){return t&&t.__esModule?t.default:t}class e{constructor(t,i){if(t instanceof e||t instanceof Object&&"x"in t&&"y"in t)return this.x=t.x,void(this.y=t.y);this.x=t,this.y=i}static orthographicProjection(t,i,s){const o=new e(i).sub(t).normalize();return new e(o.scale(new e(s).sub(t).dot(o))).add(t)}add(t){return new e(this.x+t.x,this.y+t.y)}sub(t){return new e(this.x-t.x,this.y-t.y)}scale(t){return new e(this.x*t,this.y*t)}rotate(t){return new e(this.x*Math.cos(t)-this.y*Math.sin(t),this.x*Math.sin(t)+this.y*Math.cos(t))}len2(){return this.x*this.x+this.y*this.y}len(){return Math.sqrt(this.len2())}dot(t){return t.x*this.x+t.y*this.y}normalize(){const t=this.len();if(t<Number.EPSILON||!t)throw new Error("Division by zero");return new e(this.x/t,this.y/t)}}class i{constructor(t,{x:[e,i],y:[s,o],width:n,height:r,pixelRatio:a}){this.canvas=t,this.context=t.getContext("2d"),this.fromX=e,this.fromY=s,this.toX=i,this.toY=o,this.resize(n,r,a),this.clear()}resize(t,e,i){this.width=t,this.height=e,this.pixelRatio=i,this.canvas.width=t*i,this.canvas.height=e*i,this.canvas.style.width=`${t}px`,this.canvas.style.height=`${e}px`,this.context.lineWidth=3*i}clear(){this.context.clearRect(0,0,this.width*this.pixelRatio,this.height*this.pixelRatio),this.context.lineJoin="round",this.context.lineCap="round",this.context.lineWidth=2*this.pixelRatio,this.context.fillStyle="#000",this.context.strokeStyle="#000"}drawArrow(t,e){const i=this.toCanvasVector(t),s=this.toCanvasVector(e),o=this.context,n=s.sub(i).normalize();o.beginPath(),o.moveTo(i.x,i.y),o.lineTo(s.x-10*n.x,s.y-10*n.y),o.stroke(),o.beginPath(),o.moveTo(s.x,s.y);const r=s.add(n.scale(20*this.pixelRatio).rotate(3*Math.PI/4)),a=s.add(n.scale(20*this.pixelRatio).rotate(5*Math.PI/4));o.lineTo(r.x,r.y),o.lineTo(a.x,a.y),o.closePath(),o.fillStyle="#000",o.fill()}drawPolyLine(t,e=null){const i=this.context;let s=this.toCanvasVector(t[0]);i.beginPath(),i.moveTo(s.x,s.y);for(const e of t.slice(1))s=this.toCanvasVector(e),i.lineTo(s.x,s.y);i.strokeStyle=e,i.stroke()}drawPoint(t,e=10,i=null){const s=this.context,o=this.toCanvasVector(t);s.beginPath(),s.arc(o.x,o.y,e*this.pixelRatio,0,7,!1),s.fillStyle="#fff",s.fill(),s.strokeStyle=i,s.lineWidth=e/2.5*this.pixelRatio,s.stroke()}drawCircle(t,e,i=null){const s=this.context,o=e/(this.toX-this.fromX)*this.width*this.pixelRatio,n=this.toCanvasVector(t);s.beginPath(),s.arc(n.x,n.y,o,0,7,!1),s.fillStyle="#fff",s.fill(),s.strokeStyle=i,s.lineWidth=2,s.stroke()}drawText(t,e,i){const s=this.context,o=5*this.pixelRatio,n=20*this.pixelRatio;s.font=`${n}px "Segoe UI"`;const r=this.toCanvasVector(e),a=s.measureText(t).width;switch(i){case"NE":s.fillText(t,r.x+o,r.y-o);break;case"NW":s.fillText(t,r.x-a-o,r.y-o);break;case"SE":s.fillText(t,r.x+o,r.y+n+o);break;case"SW":s.fillText(t,r.x-a-o,r.y+n+o);break;default:throw new Error("Invalid argument for type Direction")}}toCanvasVector(t){return new e((t.x-this.fromX)/(this.toX-this.fromX)*this.width*this.pixelRatio,(-t.y-this.fromY)/(this.toY-this.fromY)*this.height*this.pixelRatio)}fromCanvasPoint(t){return new e(t.x/this.width*(this.toX-this.fromX)+this.fromX,(1-t.y/this.height)*(this.toY-this.fromY)+this.fromY)}}const s=async(t,e)=>new Promise((i=>{t.addEventListener(e,(t=>{i(t)}),{once:!0})})),o=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");var n;n=JSON.parse('[{"x":-0.6,"y":-0.55,"youtubeId":"RbDsOdxZZ94","title":"My Way","artist":"Tom Walker","duration":237},{"x":-0.5,"y":-0.5,"youtubeId":"cO3UI8T4O5M","title":"Drugs","artist":"EDEN","duration":339},{"x":-0.2,"y":-0.3,"youtubeId":"hiOkMt7iJ7g","title":"Enough","artist":"The Tech Thieves","duration":202},{"x":0.1,"y":0.05,"youtubeId":"Fxnl4L8vfKA","title":"Kings & Queens","artist":"Mat Kearney","duration":190},{"x":0.2,"y":0.2,"youtubeId":"Z47pGUpMy-E","title":"Wake Up","artist":"EDEN","duration":280},{"x":0.5,"y":0.3,"youtubeId":"FVFf1-oBl8c","title":"Play Me Like A Violin","artist":"Stephen","duration":233},{"x":0.6,"y":0.5,"youtubeId":"mZE6giedL3Q","title":"Reason","artist":"Matthew Chaim","duration":201},{"x":0.9,"y":0.9,"youtubeId":"dQw4w9WgXcQ","title":"Never Gonna Give You Up","artist":"Rick Astley","duration":212},{"x":0.95,"y":0.5,"youtubeId":"UkkdaPxRR1k","title":"Upload Your Mind :: Download My Soul","artist":"Camellia","duration":134},{"x":0.4,"y":0.1,"youtubeId":"-xX6aeaoHR0","title":"Control","artist":"Aaron Taos","duration":184},{"x":0.7,"y":-0.5,"youtubeId":"z8ZqFlw6hYg","title":"Raining Blood","artist":"Slayer","duration":257},{"x":-0.7,"y":0.6,"youtubeId":"1EsaGNF2E1g","title":"J\'ai du bon tabac","artist":"Bonne nuit les petits","duration":250}]');const r={x:-.9,y:-.9,youtubeId:"l0q7MLPo-u8",title:"The Sound of Silence",artist:"Simon & Garfunkel",duration:187};for(let e=0;e<1e3;e++)r.x=2*Math.random()-1,r.y=2*Math.random()-1,t(n).push({...r});new class extends class{constructor(t){this.board=t,this.marker=new i(t,{x:[-1,1],y:[-1,1],width:400,height:400,pixelRatio:window.devicePixelRatio}),this.init()}init(){this.marker.clear(),this.marker.drawArrow({x:-.98,y:0},{x:.98,y:0}),this.marker.drawArrow({x:0,y:-.98},{x:0,y:.98}),this.marker.drawText("Sad",{x:-.03,y:-1},"NW"),this.marker.drawText("Happy",{x:-.08,y:1},"SW"),this.marker.drawText("Calm",{x:-1,y:0},"SE"),this.marker.drawText("Energetic",{x:.9,y:0},"SW")}run(){throw new Error("Unimplemented exception")}}{async run(){this.setupSlider();let t=this.initialState();for(;;){t=(await t)()}}setupSlider(){this.$duration=document.querySelector("#duration");const t=document.querySelector("#duration-tooltip");this.$duration.addEventListener("input",(()=>{t.innerHTML=`${this.$duration.value} min`}))}async initialState(){const t=await s(this.board,"click"),e=this.marker.fromCanvasPoint({x:t.offsetX,y:t.offsetY});return async()=>this.state2(e)}async state2(t){const e=e=>{const i=this.marker.fromCanvasPoint({x:e.offsetX,y:e.offsetY});this.init();const s=t.sub(i).len();s>=.2?this.marker.drawArrow(t,i):s>=Number.EPSILON&&this.marker.drawCircle(t,s,"#000")};this.board.addEventListener("mousemove",e);const i=await s(this.board,"click"),o=this.marker.fromCanvasPoint({x:i.offsetX,y:i.offsetY});return this.board.removeEventListener("mousemove",e),t.sub(o).len()<=Number.EPSILON?async()=>this.state2(o):async()=>this.fetchPlaylist(t,o)}async fetchPlaylist(t,e){this.init(),this.marker.drawArrow(t,e);const i=60*Number(this.$duration.value),s=e.sub(t).len()>=.2?this.makePathPlaylist(t,e,i):this.makeCirclePlaylist(t,e,i);return async()=>this.displayPlaylist(t,e,s)}makeCirclePlaylist(e,i,s){const o=t(n).slice(),r=[];for(const t of o)r.push([e.sub(t).len2(),t]);r.sort(((t,e)=>{const[i]=t,[s]=e;return s-i}));const a=[];for(;s>0;){const[,t]=r.pop();a.push(t),s-=t.duration}return a}makePathPlaylist(i,s,o){const r=[],a=t(n).slice(),l=[];let h=a[0],c=i.sub(h).len2(),u=a[0],d=s.sub(u).len2();for(const t of a){const o=e.orthographicProjection(i,s,t),n=o.sub(new e(t)).len2();l.push([n,o,{...t,projection:o}]),i.sub(t).len2()<c&&(h=t,c=i.sub(t).len2()),s.sub(t).len2()<d&&(u=t,d=s.sub(t).len2())}l.sort(((t,e)=>{const[i]=t,[s]=e;return i-s}));const y=[[s.sub(i).len2(),i,s]];for(;o>0&&y.length>0;){let t=y[0][0],e=y[0],i=0;for(const[s,o]of y.slice(1).entries())o[0]>t&&(e=o,t=o[0],i=s+1);y.splice(i,1);const s=e[1],n=e[2];for(const[t,[,e,i]]of l.entries()){if(i===h||i===u)continue;const a=e.sub(s).dot(n.sub(s))/n.sub(s).len2();if(a<=0||a>=1)continue;l.splice(t,1),r.push(i);const c=[e.sub(s).len2(),s,e],d=[n.sub(e).len2(),e,n];y.push(c,d),o-=i.duration;break}}return r.sort(((t,e)=>t.projection.sub(i).len2()-e.projection.sub(i).len2())),r.unshift({...h,projection:new e(0,0)}),h!==u&&r.push({...u,projection:new e(0,0)}),r}async displayPlaylist(t,e,i){const s=document.querySelector("#playlist");if(0===i.length)return s.innerHTML='<p class="user-instruction"><strong>Error:</strong> the server created an empty playlist. Please retry later.</p>',async()=>this.initialState();let n='<div class="wrapper"><ul class="music-list">';for(const t of i)n+=`<li class="item playlist-entry">\n          <img class="cover" src="https://i.ytimg.com/vi/${o(t.youtubeId)}/mqdefault.jpg" alt="Thumbnail" width="85.33" height="48">\n          <span class="title">${o(t.title)}</span>\n          <span class="artist">${o(t.artist)}</span>\n        </li>`;return n+="</ul></div>",n+=`<p class="youtube-link"><a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(i.map((t=>t.youtubeId)).join(","))}" target="_blank" rel="noopener">Listen on YouTube</a></p>`,s.innerHTML=n,async()=>this.drawPlaylist(t,e,i)}async drawPlaylist(t,i,s){return new Promise((o=>{const n=s.map((t=>new e(t))),r=e=>{const s=[];let o=0,r=n[0];const a=[r];s.push(r);for(const t of n.slice(1)){const i=t.sub(r),n=i.len();if(o+=n,e<o){s.push(r.add(i.scale((e+n-o)/n)));break}a.push(t),s.push(t),r=t}this.init();const l=t.sub(i).len();l>=.2?this.marker.drawArrow(t,i):l>=Number.EPSILON&&this.marker.drawCircle(t,l,"#000"),this.marker.drawPolyLine(s,"#F00");for(const t of a)this.marker.drawPoint(t,4);return e<o};let a=null;const l=t=>{null===a&&(a=t),r(.001*(t-a))?requestAnimationFrame(l):o((async()=>this.initialState()))};requestAnimationFrame(l)}))}}(document.querySelector("#board")).run()}();
//# sourceMappingURL=index.a249537f.js.map
