import {MusicFields, Music} from './db.d'
import {escape} from './lib/html'

const main = async () => {
  const playlists: Music[][] = JSON.parse(
    localStorage.getItem('musixy-history') ?? '[]'
  )
  let html = ''
  for (const playlist of playlists) {
    if (playlist.length < 2) continue
    const first = playlist[0]
    const last = playlist[playlist.length - 1]
    html += `<div class="entry">
      <svg class="image" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="48" height="48" viewBox="-1.2 -1.2 2.4 2.4" xml:space="preserve" style="stroke-width:.1;stroke-linecap:round">
        <line style="stroke:#000;" x1="-1.1" y1="0" x2="1.1" y2="0"/>
        <line style="stroke:#000" x1="0" y1="-1.1" x2="0" y2="1.1"/>
        <line style="stroke:#f00" x1="${first[MusicFields.X]}" y1="${-first[
      MusicFields.Y
    ]}" x2="${last[MusicFields.X]}" y2="${-last[MusicFields.Y]}"/>
        <circle style="stroke:#f00;fill:#fff" cx="${
          first[MusicFields.X]
        }" cy="${-first[MusicFields.Y]}" r=".1"/>
        <circle style="stroke:#f00;fill:#fff" cx="${
          last[MusicFields.X]
        }" cy="${-last[MusicFields.Y]}" r=".1"/>
      </svg>
      <p class="title">From <strong>${escape(
        first[MusicFields.Title]
      )}</strong> to <strong>${escape(last[MusicFields.Title])}</strong>
      </p>
      <p>
      <a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(
        playlist.map((music) => music[MusicFields.YoutubeId]).join(',')
      )}" target="_blank" rel="noopener">Listen on YouTube</a>
      </p>
    </div>`
  }

  if (playlists.length === 0) {
    html = '<p><strong>History empty</strong></p>'
  }

  document.querySelector('#playlist-history').innerHTML = html
}

void main()
