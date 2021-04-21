export const fetchPlaylist = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(require('./playlist.json'))
    }, 300)
  })
}
