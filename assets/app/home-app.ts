import {Point, Vector} from './marker'
import playlist from '../playlist.json'
import {App, state, Playlist, escapeHtml} from './app'

export class HomeApp extends App {
  async run() {
    let state: state = this.initialState()
    while (true) {
      const transition: () => state = await state
      state = transition()
    }
  }

  async initialState(): state {
    console.log('Etat: initialState')
    return new Promise((resolve) => {
      this.board.addEventListener(
        'click',
        (event) => {
          const point: Point = this.marker.fromCanvasPoint({
            x: event.offsetX,
            y: event.offsetY
          })
          console.log('Transition: initialState -> state2')
          resolve(async () => this.state2(point))
        },
        {once: true}
      )
    })
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

    return new Promise((resolve) => {
      this.board.addEventListener(
        'click',
        (event) => {
          const point: Point = this.marker.fromCanvasPoint({
            x: event.offsetX,
            y: event.offsetY
          })
          this.board.removeEventListener('mousemove', drawArrow)
          console.log('Transition: state2 -> fetchPlaylist')
          resolve(async () => this.fetchPlaylist(lastPoint, point))
        },
        {once: true}
      )
      this.board.addEventListener('mousemove', drawArrow)
    })
  }

  async fetchPlaylist(from: Point, to: Point): state {
    console.log('Etat: fetchPlaylist')
    return new Promise((resolve) => {
      this.init()
      this.marker.drawArrow(from, to)
      const response = new Promise<Playlist>((resolve) => {
        setTimeout(() => {
          resolve(playlist as Playlist)
        }, 300)
      })
      response
        .then((playlist) => {
          console.log('Transition: fetchPlaylist -> displayPlaylist')
          resolve(async () => this.displayPlaylist(from, to, playlist))
        })
        .catch((error) => {
          console.warn(error)
          console.log('Transition: fetchPlaylist -> initialState')
          resolve(async () => this.initialState())
        })
    })
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
