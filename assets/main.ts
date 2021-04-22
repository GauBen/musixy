import {Marker, Point} from './marker'

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

let lastPoint: Point = null

$board.addEventListener('click', (event) => {
  const point: Point = marker.fromCanvasPoint({
    x: event.offsetX,
    y: event.offsetY
  })
  if (lastPoint === null) {
    lastPoint = point
  } else {
    marker.drawArrow(lastPoint, point)
    lastPoint = null
  }
})
