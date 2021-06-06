import {Vector} from './marker'
import {App, state, Playlist, escapeHtml, listen, Song} from './app'

const allSongs: Song[] = []
const sof = {
  x: -0.9,
  y: -0.9,
  youtubeId: 'l0q7MLPo-u8',
  title: 'The Sound of Silence',
  artist: 'Simon & Garfunkel',
  duration: 187
}
for (let i = 0; i < 1000; i++) {
  sof.x = Math.random() * 2 - 1
  sof.y = Math.random() * 2 - 1
  allSongs.push({...sof})
}

export class HomeApp extends App {
  $duration: HTMLInputElement
  async run() {
    this.setupSlider()
    allSongs.push(...((await (await fetch('./songs.json')).json()) as Playlist))
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

    return async () => this.displayPlaylist(from, to, playlist as Playlist)
  }

  makeCirclePlaylist(from: Vector, to: Vector, duration: number) {
    const songs: Playlist = allSongs.slice()
    const distances: Array<[number, any]> = []
    for (const song of songs) {
      distances.push([from.sub(song).len2(), song])
    }

    distances.sort((a, b) => {
      const [p1] = a
      const [p2] = b
      return p2 - p1
    })

    const playlist = []
    while (duration > 0) {
      const [, song] = distances.pop()
      playlist.push(song)
      duration -= song.duration
    }

    return playlist
  }

  makePathPlaylist(from: Vector, to: Vector, duration: number) {
    const playlist: Array<Song & {projection: Vector}> = []
    const songs: Playlist = allSongs.slice()
    const projections: Array<[number, Vector, Song & {projection: Vector}]> = []
    let startSong = songs[0]
    let startSongDistance = from.sub(startSong).len2()
    let endSong = songs[0]
    let endSongDistance = to.sub(endSong).len2()

    for (const song of songs) {
      const projection = Vector.orthographicProjection(from, to, song)
      const projectionLength2 = projection.sub(new Vector(song)).len2()
      projections.push([projectionLength2, projection, {...song, projection}])
      if (from.sub(song).len2() < startSongDistance) {
        startSong = song
        startSongDistance = from.sub(song).len2()
      }

      if (to.sub(song).len2() < endSongDistance) {
        endSong = song
        endSongDistance = to.sub(song).len2()
      }
    }

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

      const from = maxSection[1]
      const to = maxSection[2]

      for (const [i, [, projection, song]] of projections.entries()) {
        if (song === startSong || song === endSong) continue
        const t = projection.sub(from).dot(to.sub(from)) / to.sub(from).len2()
        if (t <= 0 || t >= 1) continue
        projections.splice(i, 1)
        playlist.push(song)
        const section1: [number, Vector, Vector] = [
          projection.sub(from).len2(),
          from,
          projection
        ]
        const section2: [number, Vector, Vector] = [
          to.sub(projection).len2(),
          projection,
          to
        ]
        sections.push(section1, section2)
        duration -= song.duration
        break
      }
    }

    playlist.sort((song1, song2) => {
      return (
        song1.projection.sub(from).len2() - song2.projection.sub(from).len2()
      )
    })
    playlist.unshift({...startSong, projection: new Vector(0, 0)})
    if (startSong !== endSong)
      playlist.push({...endSong, projection: new Vector(0, 0)})
    return playlist
  }

  async displayPlaylist(from: Vector, to: Vector, playlist: Playlist): state {
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
            music.youtubeId
          )}/mqdefault.jpg" alt="Thumbnail" width="85.33" height="48">
          <span class="title">${escapeHtml(music.title)}</span>
          <span class="artist">${escapeHtml(music.artist)}</span>
        </li>`
    }

    html += '</ul></div>'
    html += `<p class="youtube-link"><a href="http://www.youtube.com/watch_videos?video_ids=${encodeURI(
      playlist.map((music) => music.youtubeId).join(',')
    )}" target="_blank" rel="noopener">Listen on YouTube</a></p>`
    $playlist.innerHTML = html

    return async () => this.drawPlaylist(from, to, playlist)
  }

  async drawPlaylist(from: Vector, to: Vector, playlist: Playlist): state {
    return new Promise((resolve) => {
      const vectors = playlist.map((music) => new Vector(music))

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
