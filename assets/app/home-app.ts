import {Point, Vector} from './marker'
import {App, state, Playlist, escapeHtml, listen} from './app'
import playlist from '../playlist.json'

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
    const event = await listen(this.board, 'click')
    const point: Point = this.marker.fromCanvasPoint({
      x: event.offsetX,
      y: event.offsetY
    })
    return async () => this.state2(point)
  }

  async state2(lastPoint: Point): state {
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
    return async () => this.fetchPlaylist(lastPoint, point)
  }

  async fetchPlaylist(from: Point, to: Point): state {
    this.init()
    this.marker.drawArrow(from, to)
    return async () => this.displayPlaylist(from, to, playlist as Playlist)
  }

  async displayPlaylist(from: Point, to: Point, playlist: Playlist): state {
    const $playlist = document.querySelector('#playlist')

    if (playlist.length === 0) {
      $playlist.innerHTML =
        '<p class="user-instruction"><strong>Error:</strong> the server created an empty playlist. Please retry later.</p>'
      return async () => this.initialState()
    }

    let html = '<div class="wrapper"><ul class="music-list">'

    for (const music of playlist) {
      html += `<li class="item playlist-entry">
          <img class="cover" src="https://i.ytimg.com/vi/${escapeHtml(
            music.youtubeId
          )}/mqdefault.jpg" alt="Thumbnail" width="85.33" height="48">
          <span class="title">${escapeHtml(music.title)}</span>
          <span class="artist">${escapeHtml(music.artist)}</span>
        </li>`
    }

    html += '</ul></div>'
    html += `<p class="youtube-link"><a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(
      playlist.map((music) => music.youtubeId).join(',')
    )}" target="_blank" rel="noopener">Listen on YouTube</a></p>`
    $playlist.innerHTML = html

    return async () => this.drawPlaylist(from, to, playlist)
  }

  async drawPlaylist(from: Point, to: Point, playlist: Playlist): state {
    return new Promise((resolve) => {
      const vectors = playlist.map((music) => new Vector(music))

      const draw = (time: number) => {
        const chain: Vector[] = []
        let cumulatedLength = 0
        let previous = vectors[0]
        const dots = [previous]
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

          dots.push(vector)
          chain.push(vector)
          previous = vector
        }

        this.init()
        this.marker.drawArrow(from, to)
        this.marker.drawPolyLine(chain, '#F00')
        for (const dot of dots) this.marker.drawPoint(dot, 4)
        return time < cumulatedLength
      }

      let start = null
      const frame = (t: number) => {
        if (start === null) start = t
        if (draw((t - start) * 0.001)) {
          requestAnimationFrame(frame)
        } else {
          resolve(async () => this.initialState())
        }
      }

      requestAnimationFrame(frame)
    })
  }
}

const app = new HomeApp(document.querySelector('#board'))
void app.run()
