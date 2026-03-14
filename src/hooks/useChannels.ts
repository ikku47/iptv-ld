import { useState, useRef, useCallback } from "react"
import { parseM3U } from "@/utils/m3u-parser"
import { useOptimizedSearch } from "./useOptimizedSearch"
import type { Channel, Playlist } from "@/types/iptv"

// ── Types ────────────────────────────────────────────────────────────────────

export interface ChannelsState {
  channels: Channel[]
  currentChannel: Channel | null
  selectedPlaylist: Playlist | null
  loadingPlaylist: boolean
  playlistError: string | null
}

export interface ChannelsActions {
  loadPlaylistFromUrl: (playlist: Playlist) => Promise<void>
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  selectChannel: (channel: Channel) => void
  clearChannels: () => void
  triggerFileUpload: () => void
  updateSearchQuery: (query: string) => void
}

export interface UseChannelsReturn extends ChannelsState {
  searchQuery: string
  filteredChannels: Channel[]
  isSearching: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  loadPlaylistFromUrl: ChannelsActions["loadPlaylistFromUrl"]
  handleFileUpload: ChannelsActions["handleFileUpload"]
  selectChannel: ChannelsActions["selectChannel"]
  clearChannels: ChannelsActions["clearChannels"]
  triggerFileUpload: ChannelsActions["triggerFileUpload"]
  updateSearchQuery: ChannelsActions["updateSearchQuery"]
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useChannels(): UseChannelsReturn {
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [loadingPlaylist, setLoadingPlaylist] = useState(false)
  const [playlistError, setPlaylistError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null!)

  const { searchQuery, filteredChannels, isSearching, updateSearchQuery, clearSearch } =
    useOptimizedSearch(channels, { debounceMs: 200, useIndexing: true })

  // ── Actions ────────────────────────────────────────────────────────────────

  const loadPlaylistFromUrl = useCallback(async (playlist: Playlist) => {
    setLoadingPlaylist(true)
    setPlaylistError(null)
    setSelectedPlaylist(playlist)

    try {
      const response = await fetch(playlist.url)
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const content = await response.text()
      setChannels(parseM3U(content))
      setCurrentChannel(null)
      clearSearch()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load playlist"
      setPlaylistError(message)
      console.error("[useChannels] Failed to load playlist:", error)
    } finally {
      setLoadingPlaylist(false)
    }
  }, [clearSearch])

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content !== "string") return
        setChannels(parseM3U(content))
        setSelectedPlaylist(null)
        setCurrentChannel(null)
        clearSearch()
      }
      reader.readAsText(file)
    },
    [clearSearch]
  )

  const selectChannel = useCallback((channel: Channel) => {
    setCurrentChannel(channel)
  }, [])

  const clearChannels = useCallback(() => {
    setChannels([])
    setCurrentChannel(null)
    setSelectedPlaylist(null)
    setPlaylistError(null)
    clearSearch()
  }, [clearSearch])

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    channels,
    currentChannel,
    selectedPlaylist,
    loadingPlaylist,
    playlistError,
    searchQuery,
    filteredChannels,
    isSearching,
    fileInputRef,
    loadPlaylistFromUrl,
    handleFileUpload,
    selectChannel,
    clearChannels,
    triggerFileUpload,
    updateSearchQuery,
  }
}
