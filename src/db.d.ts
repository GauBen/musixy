export type Song = [string, number, number, string, string, number]
export type DataBase = {
  axes: [string, string, string, string]
  musics: Song[]
}

export enum MusicFields {
  YoutubeId = 0,
  X = 1,
  Y = 2,
  Title = 3,
  Artist = 4,
  Duration = 5
}
