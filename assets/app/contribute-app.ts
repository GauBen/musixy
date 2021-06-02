import {Point} from './marker'
import {App, ContributionData, listen, state, API} from './app'
import getYoutubeId from 'get-youtube-id'
import {token} from './user'

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
      const elements = $form.elements as HTMLFormControlsCollection & {
        x: HTMLInputElement
        y: HTMLInputElement
        youtubeLink: HTMLInputElement
      }
      event.preventDefault()
      const data: ContributionData = {
        x: Number(elements.x.value),
        y: Number(elements.y.value),
        youtubeId: getYoutubeId(elements.youtubeLink.value)
      }
      if (token !== null) {
        data.token = token
      }

      return async () => this.addMusic(data)
    }

    return Promise.race([click(), send()])
  }

  async addMusic(data: ContributionData): state {
    const response = await (
      await fetch(`${API}/add_music`, {
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
