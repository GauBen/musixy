!function(){const e=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");(async()=>{const t=[await(await fetch("../songs.json")).json()];let n="";for(const s of t){if(s.length<2)continue;const t=s[0],o=s[s.length-1];n+=`<div class="entry">\n      <svg class="image" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="-1.2 -1.2 2.4 2.4" xml:space="preserve" style="stroke-width:.1;stroke-linecap:round">\n        <line style="stroke:#000;" x1="-1.1" y1="0" x2="1.1" y2="0"/>\n        <line style="stroke:#000" x1="0" y1="-1.1" x2="0" y2="1.1"/>\n        <line style="stroke:#f00" x1="${t.x}" y1="${-t.y}" x2="${o.x}" y2="${-o.y}"/>\n        <circle style="stroke:#f00;fill:#fff" cx="${t.x}" cy="${-t.y}" r=".1"/>\n        <circle style="stroke:#f00;fill:#fff" cx="${o.x}" cy="${-o.y}" r=".1"/>\n      </svg>\n      <p class="title">From <strong>${e(t.title)}</strong> to <strong>${e(o.title)}</strong>\n      </p>\n      <p>\n      <a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(s.map((e=>e.youtubeId)).join(","))}" target="_blank" rel="noopener">Listen on YouTube</a>\n      </p>\n    </div>`}document.querySelector("#playlist-history").innerHTML=n})()}();
//# sourceMappingURL=index.7d3507eb.js.map
