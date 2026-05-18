export type IconKey = 'web' | 'github' | 'youtube' | 'mail' | 'reddit' | 'twitch' | 'code'

export interface Shortcut {
  name: string
  url: string
  icon: IconKey
}

export type ClockType = 'analog' | 'digital'

export type WallpaperKey =
  | 'wall-default'
  | 'wall1'
  | 'wall2'
  | 'wall3'
  | 'wall4'
  | 'wall5'
  | 'wall6'
  | 'wall7'
  | 'wall8'

export type UnitType = 'metric' | 'imperial'

export type SettingsTab = 'appearance' | 'search' | 'weather' | 'misc'

export interface WeatherData {
  city: string
  temp: number
  desc: string
  iconCode: number
}

export interface SearchEngine {
  name: string
  url: string
}

export interface ToastState {
  msg: string
  id: number
}
