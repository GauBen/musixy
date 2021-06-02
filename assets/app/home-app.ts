import {Point, Vector} from './marker'
import {App, state, Playlist, escapeHtml, listen, API} from './app'

export class HomeApp extends App {
  $duration: HTMLInputElement
  async run() {
    this.setupSlider()
    let state: state = this.initialState()
    while (true) {
      const transition: () => state = await state
      state = transition()
    }
  }

  setupSlider() {
    this.$duration = document.querySelector('#duration')
    const $tooltip = document.querySelector('#duration-tooltip')
    this.$duration.addEventListener('input', () => {
      $tooltip.innerHTML = `${this.$duration.value} min`
    })
  }

  async initialState(): state {
    console.log('Etat: initialState')
    const event = await listen(this.board, 'click')
    const point: Point = this.marker.fromCanvasPoint({
      x: event.offsetX,
      y: event.offsetY
    })
    console.log('Transition: initialState -> state2')
    return async () => this.state2(point)
  }

  async state2(lastPoint: Point): state {
    console.log('Etat: state2')
    const drawArrow = (event: MouseEvent) => {
      const point: Point = this.marker.fromCanvasPoint({
        x: event.offsetX,
        y: event.offsetY
      })
      this.init()
      this.marker.drawArrow(lastPoint, point)
    }

    this.board.addEventListener('mousemove', drawArrow)

    const event = await listen(this.board, 'click')
    const point: Point = this.marker.fromCanvasPoint({
      x: event.offsetX,
      y: event.offsetY
    })
    this.board.removeEventListener('mousemove', drawArrow)
    console.log('Transition: state2 -> fetchPlaylist')
    return async () => this.fetchPlaylist(lastPoint, point)
  }

  async fetchPlaylist(from: Point, to: Point): state {
    console.log('Etat: fetchPlaylist')
    this.init()
    this.marker.drawArrow(from, to)
    const response = await (
      await fetch(`${API}/make_playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to,
          duration: 60 * Number(this.$duration.value)
        })
      })
    ).json()
    const playlist: Playlist = await response
    return async () => this.displayPlaylist(from, to, playlist)
  }

  async displayPlaylist(from: Point, to: Point, playlist: Playlist): state {
    console.log('Etat: displayPlaylist')
    const $playlist = document.querySelector('#playlist')

    let html = '<div class="wrapper"><ul class="music-list">'

    for (const music of playlist) {
      html += `<li class="item playlist-entry">
          <img class="cover" src="https://i.ytimg.com/vi/${escapeHtml(
            music.youtubeId
          )}/maxresdefault.jpg" alt="Thumbnail" width="64" height="36">
          <span class="title">${escapeHtml(music.title)}</span>
          <span class="artist">${escapeHtml(music.artist)}</span>
        </li>`
    }

    html += '</ul></div>'
    html += `<p class="youtube-link"><a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(
      playlist.map((music) => music.youtubeId).join(',')
    )}">Listen on YouTube</a></p>`
    $playlist.innerHTML = html

    console.log('Transition: displayPlaylist -> drawPlaylist')
    return async () => this.drawPlaylist(from, to, playlist)
  }

  async drawPlaylist(from: Point, to: Point, playlist: Playlist): state {
    console.log('Etat: drawPlaylist')
    return new Promise((resolve) => {
      const vectors = playlist.map((music) => new Vector(music))

      const draw = (time: number) => {
        const chain: Vector[] = []
        let cumulatedLength = 0
        let previous = vectors[0]
        chain.push(previous)

        for (const vector of vectors.slice(1)) {
          const delta = vector.sub(previous)
          const length = delta.len()
          cumulatedLength += length

          if (time < cumulatedLength) {
            chain.push(
              previous.add(
                delta.scale((time + length - cumulatedLength) / length)
              )
            )
            break
          }

          chain.push(vector)
          previous = vector
        }

        this.init()
        this.marker.drawArrow(from, to)
        this.marker.drawPolyLine(chain)
        return time < cumulatedLength
      }

      let start = null
      const frame = (t: number) => {
        if (start === null) start = t
        if (draw((t - start) * 0.001)) {
          requestAnimationFrame(frame)
        } else {
          console.log('Transition: displayPlaylist -> initialState')
          resolve(async () => this.initialState())
        }
      }

      requestAnimationFrame(frame)
    })
  }
}
