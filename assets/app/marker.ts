export interface MarkerSettings {
  x: [number, number]
  y: [number, number]
  width: number
  height: number
  pixelRatio: number
}

export interface Point {
  x: number
  y: number
}

export type Direction = 'NE' | 'NW' | 'SE' | 'SW'

export class Vector implements Point {
  readonly x: number
  readonly y: number

  constructor(x: number, y: number)
  constructor(v: Vector | Point)
  constructor(x: number | Vector | Point, y: number | undefined = undefined) {
    if (x instanceof Vector || (x instanceof Object && 'x' in x && 'y' in x)) {
      this.x = x.x
      this.y = x.y
      return
    }

    this.x = x
    this.y = y
  }

  add(v: Vector) {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  sub(v: Vector) {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  scale(s: number) {
    return new Vector(this.x * s, this.y * s)
  }

  rotate(theta: number) {
    return new Vector(
      this.x * Math.cos(theta) - this.y * Math.sin(theta),
      this.x * Math.sin(theta) + this.y * Math.cos(theta)
    )
  }

  len2() {
    return this.x * this.x + this.y * this.y
  }

  len() {
    return Math.sqrt(this.len2())
  }

  normalize() {
    return new Vector(this.x / this.len(), this.y / this.len())
  }
}

export class Marker {
  protected canvas: HTMLCanvasElement
  protected context: CanvasRenderingContext2D

  protected fromX: number
  protected fromY: number
  protected toX: number
  protected toY: number

  protected width: number
  protected height: number
  protected pixelRatio: number

  constructor(
    canvas: HTMLCanvasElement,
    {
      x: [fromX, toX],
      y: [fromY, toY],
      width,
      height,
      pixelRatio
    }: MarkerSettings
  ) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')

    this.fromX = fromX
    this.fromY = fromY
    this.toX = toX
    this.toY = toY

    this.resize(width, height, pixelRatio)
    this.clear()
  }

  resize(width: number, height: number, pixelRatio: number) {
    this.width = width
    this.height = height
    this.pixelRatio = pixelRatio

    this.canvas.width = width * pixelRatio
    this.canvas.height = height * pixelRatio
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    this.context.lineWidth = 3 * pixelRatio
  }

  clear() {
    this.context.clearRect(
      0,
      0,
      this.width * this.pixelRatio,
      this.height * this.pixelRatio
    )
    this.context.lineJoin = 'round'
    this.context.lineCap = 'round'
    this.context.lineWidth = 2 * this.pixelRatio
    this.context.fillStyle = '#000'
    this.context.strokeStyle = '#000'
  }

  drawArrow(from: Point, to: Point) {
    const canvasFrom = this.toCanvasVector(from)
    const canvasTo = this.toCanvasVector(to)
    const ctx = this.context
    const arrow = canvasTo.sub(canvasFrom).normalize()
    ctx.beginPath()
    ctx.moveTo(canvasFrom.x, canvasFrom.y)
    ctx.lineTo(canvasTo.x - arrow.x * 10, canvasTo.y - arrow.y * 10)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(canvasTo.x, canvasTo.y)
    const firstPoint = canvasTo.add(
      arrow.scale(20 * this.pixelRatio).rotate((3 * Math.PI) / 4)
    )
    const secondPoint = canvasTo.add(
      arrow.scale(20 * this.pixelRatio).rotate((5 * Math.PI) / 4)
    )
    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.lineTo(secondPoint.x, secondPoint.y)
    ctx.closePath()
    ctx.fillStyle = '#000'
    ctx.fill()
  }

  drawPolyLine(
    points: Point[],
    color: string | CanvasGradient | CanvasPattern = null
  ) {
    const ctx = this.context

    let canvasVector = this.toCanvasVector(points[0])
    ctx.beginPath()
    ctx.moveTo(canvasVector.x, canvasVector.y)

    for (const point of points.slice(1)) {
      canvasVector = this.toCanvasVector(point)
      ctx.lineTo(canvasVector.x, canvasVector.y)
    }

    ctx.strokeStyle = color
    ctx.stroke()
  }

  drawPoint(point: Point, radius = 10) {
    const ctx = this.context

    const center = this.toCanvasVector(point)
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius * this.pixelRatio, 0, 7, false)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.stroke()
  }

  drawText(text: string, point: Point, direction: Direction) {
    const ctx = this.context
    const margin = 5 * this.pixelRatio
    const h = 20 * this.pixelRatio
    ctx.font = `${h}px "Segoe UI"`
    const vect = this.toCanvasVector(point)
    const w = ctx.measureText(text).width

    switch (direction) {
      case 'NE':
        ctx.fillText(text, vect.x + margin, vect.y - margin)
        break

      case 'NW':
        ctx.fillText(text, vect.x - w - margin, vect.y - margin)
        break

      case 'SE':
        ctx.fillText(text, vect.x + margin, vect.y + h + margin)
        break

      case 'SW':
        ctx.fillText(text, vect.x - w - margin, vect.y + h + margin)
        break

      default:
        throw new Error('Invalid argument for type Direction')
    }
  }

  toCanvasVector(point: Point): Vector {
    return new Vector(
      ((point.x - this.fromX) / (this.toX - this.fromX)) *
        this.width *
        this.pixelRatio,
      ((-point.y - this.fromY) / (this.toY - this.fromY)) *
        this.height *
        this.pixelRatio
    )
  }

  fromCanvasPoint(point: Point): Vector {
    return new Vector(
      (point.x / this.width) * (this.toX - this.fromX) + this.fromX,
      (1 - point.y / this.height) * (this.toY - this.fromY) + this.fromY
    )
  }
}
