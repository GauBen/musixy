import {Marker, Point} from './marker'

export const API = '/musixy/api'

export type Playlist = Array<{
  x: number
  y: number
  youtubeId: string
  title: string
  artist: string
  duration: number
}>

export type ContributionData = {
  x: number
  y: number
  youtubeId: string
  token?: string
}

export type MakePlaylistData = {
  from: Point
  to: Point
  duration: number
  token?: string
}

export type state = Promise<() => state>

export const listen = async <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventName: K
) =>
  new Promise<HTMLElementEventMap[K]>((resolve) => {
    element.addEventListener(
      eventName,
      (event) => {
        resolve(event)
      },
      {once: true}
    )
  })

export const escapeHtml = (string: string) =>
  string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export abstract class App {
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
    this.marker.drawArrow({x: -0.98, y: 0}, {x: 0.98, y: 0})
    this.marker.drawArrow({x: 0, y: -0.98}, {x: 0, y: 0.98})
    this.marker.drawText('Sad', {x: -0.03, y: -1}, 'NW')
    this.marker.drawText('Happy', {x: -0.06, y: 1}, 'SW')
    this.marker.drawText('Calm', {x: -1, y: 0}, 'SE')
    this.marker.drawText('Energetic', {x: 0.9, y: 0}, 'SW')
  }

  run() {
    throw new Error('Unimplemented exception')
  }
}
