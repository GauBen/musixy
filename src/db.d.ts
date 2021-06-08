export type Music = [string, number, number, string, string, number]
export type DataBase = {
  axes: [string, string, string, string]
  musics: Music[]
}

export enum MusicFields {
  YoutubeId = 0,
  X = 1,
  Y = 2,
  Title = 3,
  Artist = 4,
  Duration = 5
}
