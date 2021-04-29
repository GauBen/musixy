import {Marker, Point, Vector} from './marker'
import playlist from '../playlist.json'

export type Playlist = Array<{
  x: number
  y: number
  youtubeId: string
  title: string
  artist: string
  duration: number
}>

export type ContributionData = {
  x: string
  y: string
  youtubeLink: string
}

const escapeHtml = (string: string) =>
  string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

abstract class App {
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
    throw new Error('Unimplemented exception')
  }
}

type state = () => Promise<state>

export class HomeApp extends App {
  async run() {
    let f: state = this.initialState()
    while (f) {
      f = await f()
    }
  }

  initialState(): state {
    console.log('Etat: initialState')
    return async () =>
      new Promise((resolve) => {
        this.board.addEventListener(
          'click',
          (event) => {
            const point: Point = this.marker.fromCanvasPoint({
              x: event.offsetX,
              y: event.offsetY
            })
            console.log('Transition: initialState -> state2')
            resolve(this.state2(point))
          },
          {once: true}
        )
      })
  }

  state2(lastPoint: Point): state {
    console.log('Etat: state2')
    const drawArrow = (event: MouseEvent) => {
      const point: Point = this.marker.fromCanvasPoint({
        x: event.offsetX,
        y: event.offsetY
      })
      this.init()
      this.marker.drawArrow(lastPoint, point)
    }

    return async () =>
      new Promise((resolve) => {
        this.board.addEventListener(
          'click',
          (event) => {
            const point: Point = this.marker.fromCanvasPoint({
              x: event.offsetX,
              y: event.offsetY
            })
            this.board.removeEventListener('mousemove', drawArrow)
            console.log('Transition: state2 -> fetchPlaylist')
            resolve(this.fetchPlaylist(lastPoint, point))
          },
          {once: true}
        )
        this.board.addEventListener('mousemove', drawArrow)
      })
  }

  fetchPlaylist(from: Point, to: Point): state {
    console.log('Etat: fetchPlaylist')
    return async () =>
      new Promise((resolve) => {
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
            resolve(this.displayPlaylist(from, to, playlist))
          })
          .catch((error) => {
            console.warn(error)
            console.log('Transition: fetchPlaylist -> initialState')
            resolve(this.initialState())
          })
      })
  }

  displayPlaylist(from: Point, to: Point, playlist: Playlist): state {
    console.log('Etat: displayPlaylist')
    return async () => {
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
      return this.drawPlaylist(from, to, playlist)
    }
  }

  drawPlaylist(from: Point, to: Point, playlist: Playlist): state {
    console.log('Etat: drawPlaylist')
    return async () =>
      new Promise((resolve) => {
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
            resolve(this.initialState())
          }
        }

        requestAnimationFrame(frame)
      })
  }
}

export class ContributeApp extends App {
  run() {
    let point: Point = null

    const $x: HTMLInputElement = document.querySelector('[name=x]')
    const $y: HTMLInputElement = document.querySelector('[name=y]')
    const $submit: HTMLButtonElement = document.querySelector('[type=submit]')
    const $tip: HTMLSpanElement = document.querySelector('#tip')
    const $form: HTMLFormElement = document.querySelector('form')

    this.board.addEventListener('click', (event) => {
      this.init()
      point = this.marker.fromCanvasPoint({
        x: event.offsetX,
        y: event.offsetY
      })
      this.marker.drawPoint(point)
      $tip.hidden = true
      $submit.disabled = false
      $x.value = point.x.toFixed(3)
      $y.value = point.y.toFixed(3)
    })

    $form.addEventListener('submit', (event) => {
      event.preventDefault()
      const data: ContributionData = {
        x: '',
        y: '',
        youtubeLink: ''
      }
      for (const element of ($form.elements as unknown) as NodeListOf<HTMLInputElement>) {
        console.log(element)
        if (element.name in data) {
          data[element.name] = element.value
        }
      }

      this.addMusic(data)
    })
  }

  addMusic(data: ContributionData) {
    const response = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(data instanceof Object)
      }, 300)
    })
    response
      .then((success) => {
        if (success) {
          console.log('Music added')
        } else {
          console.log('Music already added')
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
