export interface Channel {
  name: string
  url: string
  group?: string
  logo?: string
  tvgId?: string
  tvgName?: string
  tvgLogo?: string
  tvgGroup?: string
  tvgUrl?: string
  epgUrl?: string
  catchup?: string
  catchupDays?: string
  catchupSource?: string
  timeshift?: string
  aspectRatio?: string
  audioTrack?: string
  subtitleTrack?: string
  quality?: string
  resolution?: string
  frameRate?: string
  bitrate?: string
  codec?: string
  language?: string
  country?: string
  category?: string
  region?: string
  timezone?: string
  geoBlocked?: boolean
  not24_7?: boolean
  headers?: Record<string, string>
}

export interface Playlist {
  id: string
  name: string
  description: string
  url: string
  type: 'language' | 'category' | 'country' | 'custom'
  count?: number
  language?: string
  category?: string
  country?: string
  region?: string
}

export interface PlaylistsData {
  type: string
  playlists: Playlist[]
}

export interface PlaylistType {
  id: string
  name: string
  description: string
  file: string
}

export interface VideoPlayerState {
  isLoading: boolean
  isTvOn: boolean
  isMuted: boolean
  videoError: string | null
  videoReady: boolean
}

export interface ChannelListState {
  channels: Channel[]
  currentChannel: Channel | null
  searchQuery: string
  filteredChannels: Channel[]
}
