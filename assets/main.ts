import {Marker, Vector} from './marker'

const $board: HTMLCanvasElement = document.querySelector('#board')

const marker = new Marker($board, {
  x: [-1, 1],
  y: [-1, 1],
  width: 400,
  height: 400,
  pixelRatio: window.devicePixelRatio
})

marker.drawArrow({x: -1, y: 0}, {x: 1, y: 0})
marker.drawArrow({x: 0, y: -1}, {x: 0, y: 1})
marker.drawArrow({x: -0.5, y: 0.5}, {x: 0.5, y: -0.3})

const v = new Vector(2, 1)
console.log(v.x, v.y)
