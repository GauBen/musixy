import {Point} from './marker'
import {App, ContributionData} from './app'

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
