interface MarkerSettings {
  x: [number, number]
  y: [number, number]
  width: number
  height: number
  pixelRatio: number
}

interface Point {
  x: number
  y: number
}

interface CanvasPoint extends Point {}

export class Vector {
  readonly x: number
  readonly y: number
  constructor(x: number, y: number) {
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

  drawArrow(from: Point, to: Point) {
    const canvasFrom = new Vector(this.toCanvasPoint(from))
    const canvasTo = new Vector(this.toCanvasPoint(to))
    const ctx = this.context
    ctx.beginPath()
    ctx.moveTo(canvasFrom.x, canvasFrom.y)
    ctx.lineTo(canvasTo.x, canvasTo.y)
    ctx.stroke()

    const arrow = canvasTo.sub(canvasFrom).normalize()
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
    ctx.fill()
  }

  protected toCanvasPoint(point: Point): CanvasPoint {
    return {
      x:
        ((point.x - this.fromX) / (this.toX - this.fromX)) *
        this.width *
        this.pixelRatio,
      y:
        ((-point.y - this.fromY) / (this.toY - this.fromY)) *
        this.height *
        this.pixelRatio
    }
  }
}