import { useState, useCallback, useRef } from "react"
import type Player from "video.js/dist/types/player"
import type { Channel } from "@/types/iptv"

// ── Types ────────────────────────────────────────────────────────────────────

export interface VideoPlayerState {
  currentSrc: string | null
  currentHeaders?: Record<string, string>
  isLoading: boolean
  isMuted: boolean
  videoError: string | null
}

export interface VideoPlayerActions {
  playChannel: (channel: Channel) => void
  toggleMute: () => void
  handlePlayerReady: (player: Player) => void
  handlePlaying: () => void
  handleWaiting: () => void
  handleError: (message: string) => void
  handleFullscreen: () => void
  retry: () => void
}

export type UseVideoPlayerReturn = VideoPlayerState & VideoPlayerActions

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useVideoPlayer(): UseVideoPlayerReturn {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)
  const [currentHeaders, setCurrentHeaders] = useState<Record<string, string> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)

  // Store the Video.js player instance in a ref to avoid re-renders
  const playerRef = useRef<Player | null>(null)

  const handlePlayerReady = useCallback((player: Player) => {
    playerRef.current = player
  }, [])

  const playChannel = useCallback((channel: Channel) => {
    setVideoError(null)
    setIsLoading(true)
    setCurrentHeaders(channel.headers)
    setCurrentSrc(channel.url)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      playerRef.current?.muted(next)
      return next
    })
  }, [])

  const handleFullscreen = useCallback(() => {
    playerRef.current?.requestFullscreen()
  }, [])

  const handlePlaying = useCallback(() => {
    setIsLoading(false)
    setVideoError(null)
  }, [])

  const handleWaiting = useCallback(() => {
    setIsLoading(true)
  }, [])

  const handleError = useCallback((message: string) => {
    setIsLoading(false)
    setVideoError(message)
  }, [])

  const retry = useCallback(() => {
    const player = playerRef.current
    if (!currentSrc || !player || player.isDisposed()) return

    setVideoError(null)
    setIsLoading(true)

    const isHls = currentSrc.includes(".m3u8") || currentSrc.includes("mpegurl")
    player.src({ 
      src: currentSrc, 
      type: isHls ? "application/x-mpegURL" : "video/mp4",
      headers: currentHeaders 
    })
    player.play()?.catch(() => {})
  }, [currentSrc, currentHeaders])

  return {
    currentSrc,
    currentHeaders,
    isLoading,
    isMuted,
    videoError,
    playChannel,
    toggleMute,
    handlePlayerReady,
    handlePlaying,
    handleWaiting,
    handleError,
    handleFullscreen,
    retry,
  }
}
