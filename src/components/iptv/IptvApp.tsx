"use client"

import React, { useState, useEffect, useMemo } from "react"
import { TvPlayer } from "@/components/tv/TvPlayer"
import { ChannelList } from "@/components/channels/ChannelList"
import { GroupsPanel } from "@/components/channels/GroupsPanel"
import { EpgPanel } from "@/components/epg/EpgPanel"
import { useVideoPlayer } from "@/hooks/useVideoPlayer"
import { useChannels } from "@/hooks/useChannels"
import { useFavoritesStore, selectFavoriteUrls } from "@/store/useFavoritesStore"
import type { Channel, Playlist } from "@/types/iptv"

// ── Types ────────────────────────────────────────────────────────────────────

type SidebarTab = "all" | "groups" | "favorites"

const SIDEBAR_TABS: { id: SidebarTab; label: string }[] = [
  { id: "all", label: "All Channels" },
  { id: "groups", label: "Groups" },
  { id: "favorites", label: "Favorites" },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_PLAYLIST: Playlist = {
  id: "all",
  name: "All Channels",
  description: "All available IPTV channels",
  url: "https://iptv-org.github.io/iptv/index.m3u",
  type: "category",
}

// ── Sub-components ───────────────────────────────────────────────────────────

const UploadIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

// ── Component ────────────────────────────────────────────────────────────────

export const IptvApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("all")
  const [hasMounted, setHasMounted] = useState(false)

  // Hydration guard for persisted store
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // ── Video player ───────────────────────────────────────────────────────────
  const {
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
  } = useVideoPlayer()

  // ── Channel management ─────────────────────────────────────────────────────
  const {
    channels,
    currentChannel,
    selectedPlaylist,
    loadingPlaylist,
    searchQuery,
    filteredChannels,
    fileInputRef,
    handleFileUpload,
    loadPlaylistFromUrl,
    selectChannel,
    updateSearchQuery,
    triggerFileUpload,
  } = useChannels()

  // ── Favorites (Zustand + localStorage persistence) ─────────────────────────
  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore()

  // Derive a Set of URLs for O(1) per-row lookup — recomputes only when favorites change
  const favoriteUrls = useMemo(
    () => selectFavoriteUrls({ favorites, toggleFavorite, isFavorite, clearFavorites: () => {} }),
    [favorites, toggleFavorite, isFavorite]
  )

  // ── Initialisation ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadPlaylistFromUrl(DEFAULT_PLAYLIST)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChannelSelect = (channel: Channel) => {
    selectChannel(channel)
    playChannel(channel)
  }

  const handleToggleFavorite = (channel: Channel) => {
    toggleFavorite(channel)
  }

  const handleToggleCurrentFavorite = () => {
    if (currentChannel) toggleFavorite(currentChannel)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app-shell">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="sidebar">

        {/* Tab navigation */}
        <nav className="sidebar-tabs" aria-label="Channel navigation">
          {SIDEBAR_TABS.map(({ id, label }) => (
            <button
              key={id}
              className={`sidebar-tab${activeTab === id ? " active" : ""}`}
              onClick={() => setActiveTab(id)}
              aria-selected={activeTab === id}
            >
              {label}
              {id === "favorites" && favorites.length > 0 && (
                <span
                  style={{
                    marginLeft: 5,
                    fontSize: 10,
                    background: "var(--primary)",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "1px 5px",
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Search bar shared between All and Favorites */}
        {(activeTab === "all" || activeTab === "favorites") && (
          <div className="sidebar-search">
            <input
              id="channel-search"
              className="sidebar-search-input"
              type="text"
              placeholder={activeTab === "all" ? "Search channels…" : "Search favorites…"}
              value={searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              aria-label="Search channels"
            />
            {activeTab === "all" && (
              <>
                <button
                  className="sidebar-upload-btn"
                  onClick={triggerFileUpload}
                  title="Upload M3U playlist"
                  aria-label="Upload M3U playlist"
                >
                  <UploadIcon />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".m3u,.m3u8"
                  onChange={handleFileUpload}
                  aria-hidden="true"
                  style={{ display: "none" }}
                />
              </>
            )}
          </div>
        )}

        {/* ── Tab content ─────────────────────────────────────────── */}
        {!hasMounted ? (
          <div className="empty-state">
            <div className="player-loading-spinner" />
          </div>
        ) : (
          <>
            {activeTab === "all" && (
              <ChannelList
                channels={filteredChannels}
                currentChannel={currentChannel}
                isLoading={loadingPlaylist}
                favoriteUrls={favoriteUrls}
                onChannelSelect={handleChannelSelect}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === "groups" && (
              <GroupsPanel
                currentChannel={currentChannel}
                favoriteUrls={favoriteUrls}
                onChannelSelect={handleChannelSelect}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === "favorites" && (
              favorites.length === 0 ? (
                <div className="empty-state">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ opacity: 0.35 }}
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <div className="empty-state-title">No Favorites Yet</div>
                  <div className="empty-state-desc">
                    Tap the ★ next to any channel to save it here
                  </div>
                </div>
              ) : (
                <ChannelList
                  channels={favorites.filter(f => 
                    f.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )}
                  currentChannel={currentChannel}
                  favoriteUrls={favoriteUrls}
                  onChannelSelect={handleChannelSelect}
                  onToggleFavorite={handleToggleFavorite}
                />
              )
            )}
          </>
        )}

        {/* Status footer — only shown on All Channels tab */}
        {activeTab === "all" && selectedPlaylist && (
          <footer
            style={{
              flexShrink: 0,
              padding: "7px 12px",
              borderTop: "1px solid var(--border)",
              fontSize: 11,
              color: "var(--muted-foreground)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ flex: 1 }}>
              {channels.length.toLocaleString()} channels
            </span>
            <button
              onClick={triggerFileUpload}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: 11,
                padding: 0,
              }}
              aria-label="Upload M3U playlist"
            >
              Upload
            </button>
          </footer>
        )}

      </aside>

      {/* ── Video player ─────────────────────────────────────────── */}
      <TvPlayer
        currentSrc={currentSrc}
        currentHeaders={currentHeaders}
        isLoading={isLoading}
        currentChannel={currentChannel}
        videoError={videoError}
        isMuted={isMuted}
        isFavorite={currentChannel ? isFavorite(currentChannel) : false}
        selectedPlaylist={selectedPlaylist}
        channels={channels}
        onPlayerReady={handlePlayerReady}
        onError={handleError}
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onToggleMute={toggleMute}
        onToggleFavorite={handleToggleCurrentFavorite}
        onFullscreen={handleFullscreen}
        onRetry={retry}
      />

      {/* ── EPG panel ────────────────────────────────────────────── */}
      <EpgPanel currentChannel={currentChannel} />

    </div>
  )
}
