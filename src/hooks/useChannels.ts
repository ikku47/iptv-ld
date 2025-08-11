import { useState, useRef, useCallback } from "react"
import { Channel, Playlist } from "@/types/iptv"
import { parseM3U } from "@/utils/m3u-parser"
import { useOptimizedSearch } from "./useOptimizedSearch"

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [loadingPlaylist, setLoadingPlaylist] = useState(false)
  const [playlistError, setPlaylistError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    searchQuery,
    filteredChannels,
    updateSearchQuery,
    clearSearch,
    isSearching
  } = useOptimizedSearch(channels, {
    debounceMs: 200,
    useIndexing: true,
    maxResults: 200
  })

  const loadPlaylistFromUrl = useCallback(async (playlist: Playlist) => {
    try {
      setLoadingPlaylist(true)
      setPlaylistError(null)
      setSelectedPlaylist(playlist)
      
      const response = await fetch(playlist.url)
      if (!response.ok) {
        throw new Error(`Failed to load playlist: ${response.statusText}`)
      }
      
      const content = await response.text()
      const parsedChannels = parseM3U(content)
      setChannels(parsedChannels)
      
      // Clear current channel when loading new playlist
      setCurrentChannel(null)
      clearSearch()
    } catch (error) {
      setPlaylistError(error instanceof Error ? error.message : "Failed to load playlist")
      console.error("Error loading playlist:", error)
    } finally {
      setLoadingPlaylist(false)
    }
  }, [clearSearch])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const parsedChannels = parseM3U(content)
      setChannels(parsedChannels)
      setSelectedPlaylist(null) // Clear selected playlist when uploading file
      setCurrentChannel(null)
      clearSearch()
    }
    reader.readAsText(file)
  }, [clearSearch])

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
    handleFileUpload,
    loadPlaylistFromUrl,
    selectChannel,
    clearChannels,
    updateSearchQuery,
    triggerFileUpload
  }
}
