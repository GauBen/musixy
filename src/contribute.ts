import {Marker, Point} from './marker'
import getYoutubeId from 'get-youtube-id'
import {listen} from './lib/html'
import {Database} from './db.d'

type state = Promise<() => state>

export class ContributeApp {
  protected readonly marker: Marker
  protected board: HTMLCanvasElement

  protected axes: [string, string, string, string] = ['N', 'W', 'S', 'E']

  /** Loaded musics */
  protected musics: Database['musics'] = []

  constructor() {
    this.board = document.querySelector('#board')
    this.marker = new Marker(this.board, {
      x: [-1, 1],
      y: [-1, 1],
      pixelsPerUnit: 200,
      pixelRatio: window.devicePixelRatio
    })
  }

  async run() {
    let state: state = this.initialState()
    while (true) {
      const transition: () => state = await state
      state = transition()
    }
  }

  async initialState(): state {
    const $submit: HTMLButtonElement = document.querySelector('[type=submit]')
    const $tip: HTMLSpanElement = document.querySelector('#tip')
    const $youtubeLink: HTMLInputElement = document.querySelector(
      '[name=youtubeLink]'
    )
    $submit.disabled = true
    $tip.hidden = false
    $youtubeLink.value = ''

    this.drawAxes()
    const event = await listen(this.board, 'click')
    const point = this.marker.fromCanvasPoint({
      x: event.offsetX,
      y: event.offsetY
    })

    return async () => this.readyToSendState(point)
  }

  async readyToSendState(point: Point): state {
    // Return new Promise((resolve) => {
    const $x: HTMLInputElement = document.querySelector('[name=x]')
    const $y: HTMLInputElement = document.querySelector('[name=y]')
    const $submit: HTMLButtonElement = document.querySelector('[type=submit]')
    const $tip: HTMLSpanElement = document.querySelector('#tip')
    const $form: HTMLFormElement = document.querySelector('form')

    this.drawAxes()
    this.marker.drawPoint(point, 10, '#f00')
    $tip.hidden = true
    $submit.disabled = false
    $x.value = point.x.toFixed(3)
    $y.value = point.y.toFixed(3)

    const click: () => Promise<() => state> = async () => {
      const event = await listen(this.board, 'click')
      const point2 = this.marker.fromCanvasPoint({
        x: event.offsetX,
        y: event.offsetY
      })
      return async () => this.readyToSendState(point2)
    }

    const send: () => Promise<() => state> = async () => {
      const event = await listen($form, 'submit')
      event.preventDefault()

      const elements = $form.elements as HTMLFormControlsCollection & {
        x: HTMLInputElement
        y: HTMLInputElement
        youtubeLink: HTMLInputElement
      }
      const youtubeId = getYoutubeId(elements.youtubeLink.value)
      if (youtubeId === null) {
        return async () => this.readyToSendState(point)
      }

      const data = {
        x: Number(elements.x.value),
        y: Number(elements.y.value),
        youtubeId
      }

      return async () => this.addMusic(data)
    }

    return Promise.race([click(), send()])
  }

  async addMusic(data: {x: number; y: number; youtubeId: string}): state {
    console.log(data)
    return async () => this.initialState()
  }

  /** Draw the two axes */
  drawAxes() {
    this.marker.clear()
    this.marker.drawArrow({x: -0.98, y: 0}, {x: 0.98, y: 0})
    this.marker.drawArrow({x: 0, y: -0.98}, {x: 0, y: 0.98})
    this.marker.drawText(this.axes[0], {x: -0.03, y: -1}, 'NW')
    this.marker.drawText(this.axes[1], {x: -0.08, y: 1}, 'SW')
    this.marker.drawText(this.axes[2], {x: -1, y: 0}, 'SE')
    this.marker.drawText(this.axes[3], {x: 0.9, y: 0}, 'SW')
  }
}
