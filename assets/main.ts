import {Marker, Point} from './marker'
import playlist from './playlist.json'

type Playlist = Array<{x: number; y: number; youtubeId: string}>

class App {
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
    const response = new Promise((resolve) => {
      setTimeout(() => {
        resolve(playlist)
      }, 300)
    })
    response
      .then((playlist: Playlist) => {
        this.marker.drawPolyLine(playlist)
        const $playlist = document.querySelector('#playlist')

        let html = '<ul>'

        for (const music of playlist) {
          html += `<li><img src="https://i.ytimg.com/vi/${music.youtubeId}/maxresdefault.jpg" alt="Thumbnail" width="64" height="36"> ${music.youtubeId}</li>`
        }

        html += '</ul>'
        $playlist.innerHTML = html
      })
      .catch((error) => {
        console.warn(error)
      })
  }
}

const app = new App(document.querySelector('#board'))
app.run()
