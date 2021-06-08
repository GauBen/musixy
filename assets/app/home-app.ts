import {Vector} from './marker'
import {App, state, escapeHtml, listen, JSONDataBase, JSONSong} from './app'

const songToVect = (song: JSONSong) => new Vector(song[1], song[2])

export class HomeApp extends App {
  $duration: HTMLInputElement
  db: JSONDataBase

  async run() {
    this.setupSlider()

    this.db = await (await fetch('./songs.json')).json()
    for (let i = 0; i < 1000; i++)
      this.db.songs.push([
        'l0q7MLPo-u8',
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        'The Sound of Silence',
        'Simon & Garfunkel',
        187
      ])

    this.init()

    let state: state = this.initialState()
    while (true) {
      const transition: () => state = await state
      state = transition()
    }
  }

  setupSlider() {
    this.$duration = document.querySelector('#duration')
    const $tooltip = document.querySelector('#duration-tooltip')
    this.$duration.addEventListener('input', () => {
      $tooltip.innerHTML = `${this.$duration.value} min`
    })
  }

  init() {
    this.marker.clear()
    this.marker.drawArrow({x: -0.98, y: 0}, {x: 0.98, y: 0})
    this.marker.drawArrow({x: 0, y: -0.98}, {x: 0, y: 0.98})
    this.marker.drawText(this.db.axes[0], {x: -0.03, y: -1}, 'NW')
    this.marker.drawText(this.db.axes[1], {x: -0.08, y: 1}, 'SW')
    this.marker.drawText(this.db.axes[2], {x: -1, y: 0}, 'SE')
    this.marker.drawText(this.db.axes[3], {x: 0.9, y: 0}, 'SW')
  }

  async initialState(): state {
    const event = await listen(this.board, 'click')
    const point: Vector = this.marker.fromCanvasPoint({
      x: event.offsetX,
      y: event.offsetY
    })
    return async () => this.state2(point)
  }

  async state2(lastPoint: Vector): state {
    const drawArrow = (event: MouseEvent) => {
      const point: Vector = this.marker.fromCanvasPoint({
        x: event.offsetX,
        y: event.offsetY
      })
      this.init()
      const length = lastPoint.sub(point).len()
      if (length >= 0.2) this.marker.drawArrow(lastPoint, point)
      else if (length >= Number.EPSILON)
        this.marker.drawCircle(lastPoint, length, '#000')
    }

    this.board.addEventListener('mousemove', drawArrow)

    const event = await listen(this.board, 'click')
    const point: Vector = this.marker.fromCanvasPoint({
      x: event.offsetX,
      y: event.offsetY
    })
    this.board.removeEventListener('mousemove', drawArrow)
    if (lastPoint.sub(point).len() <= Number.EPSILON)
      return async () => this.state2(point)
    return async () => this.fetchPlaylist(lastPoint, point)
  }

  async fetchPlaylist(from: Vector, to: Vector): state {
    this.init()
    this.marker.drawArrow(from, to)
    const duration = 60 * Number(this.$duration.value)
    const length = to.sub(from).len()
    const playlist =
      length >= 0.2
        ? this.makePathPlaylist(from, to, duration)
        : this.makeCirclePlaylist(from, to, duration)

    return async () => this.displayPlaylist(from, to, playlist)
  }

  makeCirclePlaylist(from: Vector, to: Vector, duration: number) {
    const distances: Array<[number, JSONSong]> = []
    for (const song of this.db.songs) {
      distances.push([from.sub(songToVect(song)).len2(), song])
    }

    distances.sort((a, b) => {
      const [p1] = a
      const [p2] = b
      return p2 - p1
    })

    const playlist: JSONSong[] = []
    while (duration > 0 && distances.length > 0) {
      const [, song] = distances.pop()!
      playlist.push(song)
      duration -= song[5]
    }

    return playlist
  }

  makePathPlaylist(from: Vector, to: Vector, duration: number) {
    const playlist: Array<[number, JSONSong]> = []

    const allSongs = this.db.songs

    const projections: Array<[number, Vector, JSONSong]> = []

    let startSong = allSongs[0]
    let startSongDistance = from.sub(songToVect(startSong)).len2()
    let endSong = allSongs[0]
    let endSongDistance = to.sub(songToVect(endSong)).len2()

    for (const song of allSongs) {
      const v = songToVect(song)
      const projection = Vector.orthographicProjection(from, to, v)
      const projectionLength2 = projection.sub(v).len2()
      projections.push([projectionLength2, projection, song])

      if (from.sub(v).len2() < startSongDistance) {
        startSong = song
        startSongDistance = from.sub(v).len2()
      }

      if (to.sub(v).len2() < endSongDistance) {
        endSong = song
        endSongDistance = to.sub(v).len2()
      }
    }

    duration -= endSong === startSong ? startSong[5] : startSong[5] + endSong[5]

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

      for (const [i, [, projection, song]] of projections.entries()) {
        if (song === startSong || song === endSong) continue
        const t =
          projection.sub(sectionFrom).dot(sectionTo.sub(sectionFrom)) /
          sectionTo.sub(sectionFrom).len2()
        if (t <= 0 || t >= 1) continue
        projections.splice(i, 1)
        playlist.push([projection.sub(from).len2(), song])
        duration -= song[5]
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

    realPlaylist.unshift(startSong)
    if (startSong !== endSong) realPlaylist.push(endSong)
    return realPlaylist
  }

  async displayPlaylist(from: Vector, to: Vector, playlist: JSONSong[]): state {
    const $playlist = document.querySelector('#playlist')

    if (playlist.length === 0) {
      $playlist.innerHTML =
        '<p class="user-instruction"><strong>Error:</strong> the server created an empty playlist. Please retry later.</p>'
      return async () => this.initialState()
    }

    let html = '<div class="wrapper"><ul class="music-list">'

    for (const music of playlist) {
      html += `<li class="item playlist-entry">
          <img class="cover" src="https://i.ytimg.com/vi/${escapeHtml(
            music[0]
          )}/mqdefault.jpg" alt="Thumbnail" width="85.33" height="48">
          <span class="title">${escapeHtml(music[3])}</span>
          <span class="artist">${escapeHtml(music[4])}</span>
        </li>`
    }

    html += '</ul></div>'
    html += `<p class="youtube-link"><a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(
      playlist.map((music) => music[0]).join(',')
    )}" target="_blank" rel="noopener">Listen on YouTube</a></p>`
    $playlist.innerHTML = html

    return async () => this.drawPlaylist(from, to, playlist)
  }

  async drawPlaylist(from: Vector, to: Vector, playlist: JSONSong[]): state {
    return new Promise((resolve) => {
      const vectors = playlist.map((music) => new Vector(songToVect(music)))

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

        this.init()
        const length = from.sub(to).len()
        if (length >= 0.2) this.marker.drawArrow(from, to)
        else if (length >= Number.EPSILON)
          this.marker.drawCircle(from, length, '#000')
        this.marker.drawPolyLine(chain, '#F00')
        for (const dot of dots) this.marker.drawPoint(dot, 4)
        return time < cumulatedLength
      }

      let start = null
      const frame = (t: number) => {
        if (start === null) start = t
        if (draw((t - start) * 0.001)) {
          requestAnimationFrame(frame)
        } else {
          resolve(async () => this.initialState())
        }
      }

      requestAnimationFrame(frame)
    })
  }
}

const app = new HomeApp(document.querySelector('#board'))
void app.run()
