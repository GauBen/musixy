import {Vector, Marker} from './marker'
import {escape, listen} from './lib/html'
import {Database, Music, MusicFields} from './db.d'

const musicToVect = (music: Music) =>
  new Vector(music[MusicFields.X], music[MusicFields.Y])

type state = Promise<() => state>

const CIRCLE_TRESHOLD = 0.2

export class HomeApp {
  /** Canvas element */
  protected $board: HTMLCanvasElement

  /** 2DContext drawer */
  protected marker: Marker

  /** The duration slider */
  protected $duration: HTMLInputElement

  /** The tooltip associated with the slider */
  protected $tooltip: HTMLElement

  /** Loaded musics */
  protected database: Database

  /** Selected database file */
  protected databaseFile = './db.json'

  /** Current state of the automaton */
  protected state: (...args: any) => state

  constructor({
    board,
    duration,
    tooltip
  }: {
    board: HTMLCanvasElement
    duration: HTMLInputElement
    tooltip: HTMLElement
  }) {
    this.$board = board
    this.$duration = duration
    this.$tooltip = tooltip

    this.marker = new Marker(board, {
      x: [-1, 1],
      y: [-1, 1],
      pixelsPerUnit: 200,
      pixelRatio: window.devicePixelRatio
    })

    this.$tooltip.innerHTML = `${this.$duration.value} min`
    this.$duration.addEventListener('input', () => {
      this.$tooltip.innerHTML = `${this.$duration.value} min`
    })
  }

  /** Start the finite-state automaton */
  async run(): Promise<never> {
    let state: state = this.loadDatabase()
    while (true) {
      const transition: () => state = await state
      state = transition()
    }
  }

  /** Fetch the music database */
  async loadDatabase(): state {
    this.state = this.loadDatabase
    this.database = await (await fetch(this.databaseFile)).json()
    for (let i = 0; i < 1000; i++)
      this.database.musics.push([
        'l0q7MLPo-u8',
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        'The Sound of Silence',
        'Simon & Garfunkel',
        187
      ])
    this.drawAxes()
    return async () => this.resetApp()
  }

  resetApp(): () => state {
    const $playlist = document.querySelector('#playlist')
    $playlist.innerHTML =
      '<p class="user-instruction">Click twice on the whiteboard to create a playlist</p>'
    return async () => this.waitForFirstInput()
  }

  /** Wait for a click, a touch start or a drag start */
  async waitForFirstInput(): state {
    this.state = this.waitForFirstInput
    return Promise.race([
      (async () => {
        const event = await listen(this.$board, 'click')
        const point: Vector = this.marker.fromCanvasPoint({
          x: event.offsetX,
          y: event.offsetY
        })
        return async () => this.waitForSecondClick(point)
      })(),
      this.awaitReloadEvent()
    ])
  }

  /** Wait for the second click */
  async waitForSecondClick(lastPoint: Vector): state {
    const drawPreview = (event: MouseEvent) => {
      const point: Vector = this.marker.fromCanvasPoint({
        x: event.offsetX,
        y: event.offsetY
      })
      this.drawAxes()
      this.drawPathPreview(lastPoint, point)
    }

    this.$board.addEventListener('mousemove', drawPreview)

    const transition = await Promise.race([
      (async () => {
        // Wait for second click
        const event = await listen(this.$board, 'click')

        const point: Vector = this.marker.fromCanvasPoint({
          x: event.offsetX,
          y: event.offsetY
        })

        // Protect against double clicks
        if (lastPoint.sub(point).len() <= Number.EPSILON)
          return async () => this.waitForSecondClick(point)

        return async () => this.makePlaylist(lastPoint, point)
      })(),

      this.awaitReloadEvent()
    ])

    this.$board.removeEventListener('mousemove', drawPreview)

    return transition
  }

  async awaitReloadEvent(): Promise<() => state> {
    const $select: HTMLSelectElement = document.querySelector('#database')
    await listen($select, 'input')
    this.databaseFile = $select.value
    return async () => this.loadDatabase()
  }

  /** Make a playlist based on the two points given */
  makePlaylist(from: Vector, to: Vector): () => state {
    this.drawAxes()
    this.drawPathPreview(from, to)

    const duration = 60 * Number(this.$duration.value)
    const length = to.sub(from).len()
    const playlist =
      length >= CIRCLE_TRESHOLD
        ? this.makeArrowPlaylist(from, to, duration)
        : this.makeCirclePlaylist(from, to, duration)

    return async () => this.displayPlaylist(from, to, playlist)
  }

  /** If the two points are close, make a circular playlist */
  makeCirclePlaylist(from: Vector, to: Vector, duration: number) {
    const distances: Array<[number, Music]> = []
    for (const music of this.database.musics) {
      distances.push([from.sub(musicToVect(music)).len2(), music])
    }

    distances.sort((a, b) => {
      const [p1] = a
      const [p2] = b
      return p2 - p1
    })

    const playlist: Music[] = []
    while (duration > 0 && distances.length > 0) {
      const [, music] = distances.pop()
      playlist.push(music as Music)
      duration -= music[MusicFields.Duration]
    }

    return playlist
  }

  /** If the two points are far, make a linear playlist */
  makeArrowPlaylist(from: Vector, to: Vector, duration: number) {
    const playlist: Array<[number, Music]> = []

    const projections: Array<[number, Vector, Music]> = []

    let firstMusic = this.database.musics[0]
    let firstMusicDistance = from.sub(musicToVect(firstMusic)).len2()
    let lastMusic = this.database.musics[0]
    let lastMusicDistance = to.sub(musicToVect(lastMusic)).len2()

    for (const music of this.database.musics) {
      const v = musicToVect(music)
      const projection = Vector.orthographicProjection(from, to, v)
      const projectionLength = projection.sub(v).len2()
      projections.push([projectionLength, projection, music])

      if (from.sub(v).len2() < firstMusicDistance) {
        firstMusic = music
        firstMusicDistance = from.sub(v).len2()
      }

      if (to.sub(v).len2() < lastMusicDistance) {
        lastMusic = music
        lastMusicDistance = to.sub(v).len2()
      }
    }

    duration -=
      lastMusic === firstMusic
        ? firstMusic[MusicFields.Duration]
        : firstMusic[MusicFields.Duration] + lastMusic[MusicFields.Duration]

    projections.sort((a, b) => {
      const [p1] = a
      const [p2] = b
      return p1 - p2
    })

    const sections: Array<[number, Vector, Vector]> = [
      [to.sub(from).len2(), from, to]
    ]

    while (duration > 0 && sections.length > 0) {
      let maxSectionLength = sections[0][0]
      let maxSection = sections[0]
      let maxI = 0
      for (const [i, section] of sections.slice(1).entries()) {
        if (section[0] > maxSectionLength) {
          maxSection = section
          maxSectionLength = section[0]
          maxI = i + 1
        }
      }

      sections.splice(maxI, 1)

      const sectionFrom = maxSection[1]
      const sectionTo = maxSection[2]

      for (const [i, [, projection, music]] of projections.entries()) {
        if (music === firstMusic || music === lastMusic) continue
        const t =
          projection.sub(sectionFrom).dot(sectionTo.sub(sectionFrom)) /
          sectionTo.sub(sectionFrom).len2()
        if (t <= 0 || t >= 1) continue
        projections.splice(i, 1)
        playlist.push([projection.sub(from).len2(), music])
        duration -= music[MusicFields.Duration]
        const section1: [number, Vector, Vector] = [
          projection.sub(sectionFrom).len2(),
          sectionFrom,
          projection
        ]
        const section2: [number, Vector, Vector] = [
          sectionTo.sub(projection).len2(),
          projection,
          sectionTo
        ]
        sections.push(section1, section2)
        break
      }
    }

    playlist.sort((a, b) => {
      const [p1] = a
      const [p2] = b
      return p1 - p2
    })
    const realPlaylist = playlist.map((x) => {
      const [, y] = x
      return y
    })

    realPlaylist.unshift(firstMusic)
    if (firstMusic !== lastMusic) realPlaylist.push(lastMusic)
    return realPlaylist
  }

  displayPlaylist(from: Vector, to: Vector, playlist: Music[]): () => state {
    const $playlist = document.querySelector('#playlist')

    if (playlist.length === 0) {
      $playlist.innerHTML =
        '<p class="user-instruction"><strong>Error:</strong> the server created an empty playlist. Please retry later.</p>'
      return async () => this.waitForFirstInput()
    }

    let html = '<div class="wrapper"><ul class="music-list">'

    for (const music of playlist) {
      html += `<li class="item playlist-entry">
          <img class="cover" src="https://i.ytimg.com/vi/${escape(
            music[0]
          )}/mqdefault.jpg" alt="Thumbnail" width="85.33" height="48">
          <span class="title">${escape(music[MusicFields.Title])}</span>
          <span class="artist">${escape(music[MusicFields.Artist])}</span>
        </li>`
    }

    html += '</ul></div>'
    html += `<p class="youtube-link"><a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(
      playlist.map((music) => music[MusicFields.YoutubeId]).join(',')
    )}" target="_blank" rel="noopener">Listen on YouTube</a></p>`
    $playlist.innerHTML = html

    return async () => this.drawPlaylist(from, to, playlist)
  }

  async drawPlaylist(from: Vector, to: Vector, playlist: Music[]): state {
    this.state = this.drawPlaylist

    return Promise.race([
      new Promise<() => state>((resolve) => {
        const vectors = playlist.map((music) => musicToVect(music))

        const draw = (time: number) => {
          const chain: Vector[] = []
          let cumulatedLength = 0
          let previous = vectors[0]
          const dots = [previous]
          chain.push(previous)

          for (const vector of vectors.slice(1)) {
            const delta = vector.sub(previous)
            const length = delta.len()
            cumulatedLength += length

            if (time < cumulatedLength) {
              chain.push(
                previous.add(
                  delta.scale((time + length - cumulatedLength) / length)
                )
              )
              break
            }

            dots.push(vector)
            chain.push(vector)
            previous = vector
          }

          this.drawAxes()
          this.drawPathPreview(from, to)
          this.marker.drawPolyLine(chain, '#F00')
          for (const dot of dots) this.marker.drawPoint(dot, 4)
          return time < cumulatedLength
        }

        let start: number | null = null
        const frame = (t: number) => {
          if (this.state !== this.drawPlaylist) return
          if (start === null) start = t
          if (draw((t - start) * 0.001)) {
            requestAnimationFrame(frame)
          } else {
            resolve(async () => this.waitForFirstInput())
          }
        }

        requestAnimationFrame(frame)
      }),
      this.awaitReloadEvent()
    ])
  }

  /** Draw the two axes */
  drawAxes() {
    this.marker.clear()
    this.marker.drawArrow({x: -0.98, y: 0}, {x: 0.98, y: 0})
    this.marker.drawArrow({x: 0, y: -0.98}, {x: 0, y: 0.98})
    this.marker.drawText(this.database.axes[0], {x: -0.03, y: -1}, 'NW')
    this.marker.drawText(this.database.axes[1], {x: -0.08, y: 1}, 'SW')
    this.marker.drawText(this.database.axes[2], {x: -1, y: 0}, 'SE')
    this.marker.drawText(this.database.axes[3], {x: 0.9, y: 0}, 'SW')
  }

  /** Draw a circle or an arrow whether to two points are close */
  drawPathPreview(from: Vector, to: Vector) {
    const length = to.sub(from).len()
    if (length >= CIRCLE_TRESHOLD) this.marker.drawArrow(from, to)
    else if (length >= Number.EPSILON)
      this.marker.drawCircle(from, length, '#000')
  }
}

const app = new HomeApp({
  board: document.querySelector('#board'),
  duration: document.querySelector('#duration'),
  tooltip: document.querySelector('#duration-tooltip')
})
void app.run()
