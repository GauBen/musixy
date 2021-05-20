import {Point} from './marker'
import {App, ContributionData, listen, state, API} from './app'

export class ContributeApp extends App {
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
    this.init()
    $youtubeLink.value = ''

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

    this.init()
    this.marker.drawPoint(point)
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
      const data: ContributionData = {
        x: 0,
        y: 0,
        youtubeLink: ''
      }
      for (const element of ($form.elements as unknown) as NodeListOf<HTMLInputElement>) {
        if (element.name in data) {
          data[element.name] = ['x', 'y'].includes(element.name)
            ? element.value
            : Number(element.value)
        }
      }

      return async () => this.addMusic(data)
    }

    return Promise.race([click(), send()])
  }

  async addMusic(data: ContributionData): state {
    const response = await (
      await fetch(`${API}/make_playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    ).json()
    const {success}: {success: boolean} = await response
    if (success) {
      console.log('Music added')
    } else {
      console.log('Music already added')
    }

    return async () => this.initialState()
  }
}
