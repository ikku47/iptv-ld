"use client"

import React from "react"
import { Star, Volume2, VolumeX, Maximize, Tv } from "lucide-react"
import { VideoJsPlayer } from "./VideoJsPlayer"
import type Player from "video.js/dist/types/player"
import type { Channel, Playlist } from "@/types/iptv"

// ── Types ────────────────────────────────────────────────────────────────────

export interface TvPlayerProps {
  currentSrc: string | null
  isLoading: boolean
  currentChannel: Channel | null
  videoError: string | null
  isMuted: boolean
  isFavorite: boolean
  /** Unused by component but kept for consistent prop surface with IptvApp state */
  selectedPlaylist: Playlist | null
  channels: Channel[]
  onPlayerReady: (player: Player) => void
  onError: (message: string) => void
  onPlaying: () => void
  onWaiting: () => void
  onToggleMute: () => void
  onToggleFavorite: () => void
  onFullscreen: () => void
  onRetry: () => void
}

// ── Sub-components ───────────────────────────────────────────────────────────

const NoSignal: React.FC = () => (
  <div className="player-no-signal">
    <Tv size={44} className="player-no-signal-icon" />
    <span style={{ fontSize: 14, color: "oklch(0.50 0 0)", fontWeight: 500 }}>NO SIGNAL</span>
    <span style={{ fontSize: 12, color: "oklch(0.40 0 0)" }}>Select a channel from the list</span>
  </div>
)

interface ErrorOverlayProps {
  message: string
  onRetry: () => void
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ message, onRetry }) => (
  <div className="player-error">
    <Tv size={36} style={{ opacity: 0.4 }} />
    <span style={{ fontSize: 13, color: "oklch(0.65 0.22 25)" }}>{message}</span>
    <button
      onClick={onRetry}
      style={{
        background: "oklch(0.55 0.22 25)",
        border: "none",
        borderRadius: 4,
        color: "#fff",
        padding: "6px 18px",
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      Retry
    </button>
  </div>
)

const BufferingOverlay: React.FC = () => (
  <div className="player-loading" style={{ pointerEvents: "none" }}>
    <div className="player-loading-spinner" />
    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Buffering…</span>
  </div>
)

// ── Component ────────────────────────────────────────────────────────────────

export const TvPlayer: React.FC<TvPlayerProps> = ({
  currentSrc,
  isLoading,
  currentChannel,
  videoError,
  isMuted,
  isFavorite,
  onPlayerReady,
  onError,
  onPlaying,
  onWaiting,
  onToggleMute,
  onToggleFavorite,
  onFullscreen,
  onRetry,
}) => (
  <div className="player-column">

    {/* ── Top bar ──────────────────────────────────────────────── */}
    <div className="player-topbar">
      <button
        className={`topbar-btn${isFavorite ? " active" : ""}`}
        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        onClick={onToggleFavorite}
        disabled={!currentChannel}
        style={isFavorite ? { color: "oklch(0.80 0.20 55)" } : undefined}
      >
        <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
      </button>
      <span className="player-topbar-channel">
        {currentChannel?.name ?? "— Select a Channel —"}
      </span>
      <button className="epg-btn" aria-label="EPG">EPG</button>
    </div>

    {/* ── Video area ───────────────────────────────────────────── */}
    <div className="player-video-area">
      {/* Video.js is always mounted; src prop drives playback */}
      <VideoJsPlayer
        src={currentSrc}
        onPlayerReady={onPlayerReady}
        onError={onError}
        onPlaying={onPlaying}
        onWaiting={onWaiting}
      />

      {/* Overlays — mutually exclusive, layered on top */}
      {isLoading && currentSrc && <BufferingOverlay />}
      {videoError && <ErrorOverlay message={videoError} onRetry={onRetry} />}
      {!currentSrc && !videoError && <NoSignal />}

      {/* Channel name watermark */}
      {currentChannel && currentSrc && !videoError && (
        <div className="player-channel-watermark">{currentChannel.name}</div>
      )}
    </div>

    {/* ── Controls bar ─────────────────────────────────────────── */}
    <div className="player-controls">
      <button
        className="ctrl-btn"
        onClick={onToggleMute}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {currentChannel && (
        <div className="live-badge">
          <span className="live-dot" />
          LIVE
        </div>
      )}

      <div className="controls-spacer" />

      <button className="ctrl-btn" onClick={onFullscreen} title="Fullscreen">
        <Maximize size={16} />
      </button>
    </div>

  </div>
)
