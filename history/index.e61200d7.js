!function(){function t(t){return t&&t.__esModule?t.default:t}const e=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");var o;o=JSON.parse('[{"x":-0.6,"y":-0.55,"youtubeId":"RbDsOdxZZ94","title":"My Way","artist":"Tom Walker","duration":237},{"x":-0.5,"y":-0.5,"youtubeId":"cO3UI8T4O5M","title":"Drugs","artist":"EDEN","duration":339},{"x":-0.2,"y":-0.3,"youtubeId":"hiOkMt7iJ7g","title":"Enough","artist":"The Tech Thieves","duration":202},{"x":0.1,"y":0.05,"youtubeId":"Fxnl4L8vfKA","title":"Kings & Queens","artist":"Mat Kearney","duration":190},{"x":0.2,"y":0.2,"youtubeId":"Z47pGUpMy-E","title":"Wake Up","artist":"EDEN","duration":280},{"x":0.5,"y":0.3,"youtubeId":"FVFf1-oBl8c","title":"Play Me Like A Violin","artist":"Stephen","duration":233},{"x":0.6,"y":0.5,"youtubeId":"mZE6giedL3Q","title":"Reason","artist":"Matthew Chaim","duration":201},{"x":0.9,"y":0.9,"youtubeId":"dQw4w9WgXcQ","title":"Never Gonna Give You Up","artist":"Rick Astley","duration":212},{"x":0.95,"y":0.5,"youtubeId":"UkkdaPxRR1k","title":"Upload Your Mind :: Download My Soul","artist":"Camellia","duration":134},{"x":0.4,"y":0.1,"youtubeId":"-xX6aeaoHR0","title":"Control","artist":"Aaron Taos","duration":184}]');(async()=>{const i=[t(o)];let n="";for(const t of i){if(t.length<2)continue;const o=t[0],i=t[t.length-1];n+=`<div class="entry">\n      <svg class="image" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="-1.2 -1.2 2.4 2.4" xml:space="preserve" style="stroke-width:.1;stroke-linecap:round">\n        <line style="stroke:#000;" x1="-1.1" y1="0" x2="1.1" y2="0"/>\n        <line style="stroke:#000" x1="0" y1="-1.1" x2="0" y2="1.1"/>\n        <line style="stroke:#f00" x1="${o.x}" y1="${-o.y}" x2="${i.x}" y2="${-i.y}"/>\n        <circle style="stroke:#f00;fill:#fff" cx="${o.x}" cy="${-o.y}" r=".1"/>\n        <circle style="stroke:#f00;fill:#fff" cx="${i.x}" cy="${-i.y}" r=".1"/>\n      </svg>\n      <p class="title">From <strong>${e(o.title)}</strong> to <strong>${e(i.title)}</strong>\n      </p>\n      <p>\n      <a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(t.map((t=>t.youtubeId)).join(","))}" target="_blank" rel="noopener">Listen on YouTube</a>\n      </p>\n    </div>`}document.querySelector("#playlist-history").innerHTML=n})()}();
//# sourceMappingURL=index.e61200d7.js.map
