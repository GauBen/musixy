import playlist from './playlist.json'

const $board: HTMLCanvasElement = document.querySelector('#board')
const ctx = $board.getContext('2d')

$board.width = 400
$board.height = 400

ctx.lineWidth = 5
ctx.lineCap = 'round'
ctx.lineJoin = 'round'

const drawPlaylist = (playlist) => {
  const firstMusic = playlist.shift()

  ctx.beginPath()
  ctx.moveTo(200 + 200 * firstMusic.x, 200 + 200 * firstMusic.y)

  for (const music of playlist) {
    ctx.lineTo(200 + 200 * music.x, 200 + 200 * music.y)
  }
  ctx.stroke()
}

const fetchPlaylist = () => {
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(playlist), 300)
  }).then((value) => {
    drawPlaylist(value)
  }).catch((reason) => {
    console.log(reason)
  })
}

let draw = false
let firstPoint = { x: 0, y: 0 }
let lastPoint = { x: 0, y: 0 }

$board.addEventListener('mousedown', (e) => {
  draw = true
  ctx.beginPath()
  ctx.moveTo(e.offsetX, e.offsetY)
  ctx.arc(e.offsetX, e.offsetY, 1.5, 0, 3.15 * 2)
  ctx.fill()
  firstPoint = lastPoint = { x: e.offsetX, y: e.offsetY }
})

const endSegment = () => {
  ctx.beginPath()
  ctx.moveTo(firstPoint.x, firstPoint.y)
  ctx.lineTo(lastPoint.x, lastPoint.y)
  ctx.stroke()

  fetchPlaylist(firstPoint, lastPoint)
}

document.body.addEventListener('mouseup', () => {
  if (draw) {
    endSegment()
    draw = false
  }
})

$board.addEventListener('mousemove', (e) => {
  if (draw) {
    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.stroke()
    lastPoint = { x: e.offsetX, y: e.offsetY }
  }
})

$board.addEventListener('mouseout', (e) => {
  if (draw) {
    endSegment()
    draw = false
  }
})
