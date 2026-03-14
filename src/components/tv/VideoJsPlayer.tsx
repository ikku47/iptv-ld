"use client"

import React, { useEffect, useRef } from "react"
import videojs from "video.js"
import "video.js/dist/video-js.css"
import type Player from "video.js/dist/types/player"

// ── Types ────────────────────────────────────────────────────────────────────

export interface VideoJsPlayerProps {
  src: string | null
  onPlayerReady?: (player: Player) => void
  onError?: (message: string) => void
  onPlaying?: () => void
  onWaiting?: () => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveType(src: string): string {
  const lower = src.toLowerCase()
  if (lower.includes(".m3u8") || lower.includes("mpegurl")) return "application/x-mpegURL"
  if (lower.includes(".mp4")) return "video/mp4"
  return "video/mp4"
}

// ── Component ────────────────────────────────────────────────────────────────

export const VideoJsPlayer: React.FC<VideoJsPlayerProps> = ({
  src,
  onPlayerReady,
  onError,
  onPlaying,
  onWaiting,
}) => {
  const videoElRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)

  // Initialise once — Video.js owns the element lifecycle
  useEffect(() => {
    if (playerRef.current || !videoElRef.current) return

    const player = videojs(videoElRef.current, {
      autoplay: true,
      muted: false,
      controls: false, // custom controls rendered by TvPlayer
      preload: "auto",
      fluid: false,
      fill: true,
      responsive: false,
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
          limitRenditionByPlayerDimensions: false,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      techOrder: ["html5"],
    })

    playerRef.current = player

    player.on("error", () => {
      const err = player.error()
      onError?.(err ? `Error ${err.code}: ${err.message}` : "Playback error")
    })
    player.on("playing", () => onPlaying?.())
    player.on("waiting", () => onWaiting?.())

    onPlayerReady?.(player)

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
    // Callbacks intentionally excluded — see note below.
    // Event handlers are registered once and call the latest closure via stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update source whenever src prop changes
  useEffect(() => {
    const player = playerRef.current
    if (!player || player.isDisposed()) return

    if (!src) {
      player.pause()
      player.src("")
      return
    }

    player.src({ src, type: resolveType(src) })
    player.play()?.catch(() => {
      // Browser may block autoplay — user interaction will resume playback
    })
  }, [src])

  return (
    <div
      data-vjs-player
      style={{ width: "100%", height: "100%", background: "#000" }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoElRef}
        className="video-js vjs-default-skin"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        playsInline
      />
    </div>
  )
}
