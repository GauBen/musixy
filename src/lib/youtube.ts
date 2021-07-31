declare let YT: any

const script = document.createElement('script')
script.src = 'https://www.youtube.com/iframe_api'
document.head.append(script)

let youtubeReady = false

const waitForYoutube = async (): Promise<void> => {
  if (youtubeReady) return
  await new Promise((resolve) => {
    // @ts-expect-error Youtube ¯\_(ツ)_/¯
    window.onYouTubeIframeAPIReady = resolve
  })
  youtubeReady = true
}

export const getVideoData = async (
  id: string
): Promise<{
  title: string
  author: string
  duration: number
}> => {
  const [{title, author}, duration] = await Promise.all([
    fetch(
      `https://www.youtube.com/oembed?url=https%3A//youtube.com/watch%3Fv%3D${id}&format=json`
    )
      .then(async (response) => response.json())
      .then(({title, author_name: author}) => ({title, author})),
    waitForYoutube().then(
      async () =>
        new Promise<number>((resolve) => {
          const playerElement = document.createElement('div')
          document.body.append(playerElement)

          const player = new YT.Player(playerElement, {
            videoId: id,
            events: {
              onReady: () => {
                resolve(player.getDuration() as number)
                player.destroy()
              }
            }
          })
        })
    )
  ])
  return {title, author, duration}
}
