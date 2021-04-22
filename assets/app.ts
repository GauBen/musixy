import {Marker, Point, Vector} from './marker'
import playlist from './playlist.json'

export type Playlist = Array<{x: number; y: number; youtubeId: string}>

export class App {
  protected board: HTMLCanvasElement
  protected marker: Marker

  constructor(board: HTMLCanvasElement) {
    this.board = board
    this.marker = new Marker(board, {
      x: [-1, 1],
      y: [-1, 1],
      width: 400,
      height: 400,
      pixelRatio: window.devicePixelRatio
    })
    this.init()
  }

  init() {
    this.marker.clear()
    this.marker.drawArrow({x: -1, y: 0}, {x: 1, y: 0})
    this.marker.drawArrow({x: 0, y: -1}, {x: 0, y: 1})
  }

  run() {
    let lastPoint: Point = null

    this.board.addEventListener('click', (event) => {
      const point: Point = this.marker.fromCanvasPoint({
        x: event.offsetX,
        y: event.offsetY
      })
      if (lastPoint === null) {
        lastPoint = point
      } else {
        this.fetchPlaylist(lastPoint, point)
        lastPoint = null
      }
    })

    this.board.addEventListener('mousemove', (event) => {
      const point: Point = this.marker.fromCanvasPoint({
        x: event.offsetX,
        y: event.offsetY
      })
      if (lastPoint !== null) {
        this.init()
        this.marker.drawArrow(lastPoint, point)
      }
    })
  }

  fetchPlaylist(from: Point, to: Point) {
    this.init()
    this.marker.drawArrow(from, to)
    const response = new Promise<Playlist>((resolve) => {
      setTimeout(() => {
        resolve(playlist as Playlist)
      }, 300)
    })
    response
      .then((playlist: Playlist) => {
        this.drawPlaylist(playlist)

        const $playlist = document.querySelector('#playlist')

        let html = '<ul>'

        for (const music of playlist) {
          html += `<li><img src="https://i.ytimg.com/vi/${music.youtubeId}/maxresdefault.jpg" alt="Thumbnail" width="64" height="36"> ${music.youtubeId}</li>`
        }

        html += '</ul>'
        html += `<a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(
          playlist.map((music) => music.youtubeId).join(',')
        )}">Listen on YouTube</a>`
        $playlist.innerHTML = html
      })
      .catch((error) => {
        console.warn(error)
      })
  }

  drawPlaylist(playlist: Playlist) {
    const vectors = playlist.map((music) => new Vector(music))

    const draw = (time) => {
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
              delta.scale((time - cumulatedLength + length) / length)
            )
          )
          break
        }

        chain.push(vector)
        previous = vector
      }

      this.init()
      this.marker.drawPolyLine(chain)
      return time < cumulatedLength
    }

    let start = null
    const frame = (t) => {
      if (start === null) start = t
      if (draw((t - start) * 0.001)) {
        requestAnimationFrame(frame)
      }
    }

    requestAnimationFrame(frame)
  }
}
