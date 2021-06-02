import {API, escapeHtml, Playlist} from './app'
import {user} from './user'

const main = async () => {
  if (user === null) {
    location.href = '../login/'
    return
  }

  const response: Playlist[] = await (
    await fetch(`${API}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: user})
    })
  ).json()
  let html = ''
  for (const playlist of response) {
    if (playlist.length < 2) continue
    const first = playlist[0]
    const last = playlist[playlist.length - 1]
    html += `<div class="entry">
      <svg class="image" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="-1 -1 2 2" xml:space="preserve" style="stroke-width:.09;stroke-linecap:round">
        <line style="stroke:#000;" x1="-.95" y1="0" x2=".95" y2="0"/>
        <line style="stroke:#000" x1="0" y1="-.95" x2="0" y2=".95"/>
        <line style="stroke:#f00" x1="${first.x}" y1="${-first.y}" x2="${
      last.x
    }" y2="${-last.y}"/>
        <circle style="stroke:#f00;fill:#fff" cx="${
          first.x
        }" cy="${-first.y}" r=".1"/>
        <circle style="stroke:#f00;fill:#fff" cx="${
          last.x
        }" cy="${-last.y}" r=".1"/>
      </svg>
      <p class="title">From <strong>${escapeHtml(
        first.title
      )}</strong> to <strong>${escapeHtml(last.title)}</strong>
      </p>
      <p>
      <a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(
        playlist.map((music) => music.youtubeId).join(',')
      )}" target="_blank" rel="noopener">Listen on YouTube</a>
      </p>
    </div>`
  }

  document.querySelector('#playlist-history').innerHTML = html
}

void main()
