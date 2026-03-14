"use client"

import React, { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Tv, Star } from "lucide-react"
import type { Channel } from "@/types/iptv"

// ── Types ────────────────────────────────────────────────────────────────────

export interface ChannelListProps {
  channels: Channel[]
  currentChannel: Channel | null
  isLoading?: boolean
  /** Set of URLs that are currently favorited — enables O(1) lookup per row */
  favoriteUrls?: Set<string>
  onChannelSelect: (channel: Channel) => void
  onToggleFavorite?: (channel: Channel) => void
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 44 // px — must match .channel-item height in CSS

// ── Sub-components ───────────────────────────────────────────────────────────

const LoadingState: React.FC = () => (
  <div className="empty-state">
    <div
      style={{
        width: 28,
        height: 28,
        border: "3px solid var(--border)",
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <span className="empty-state-desc">Loading channels…</span>
  </div>
)

const EmptyState: React.FC = () => (
  <div className="empty-state">
    <Tv size={36} className="empty-state-icon" />
    <div className="empty-state-title">No channels found</div>
    <div className="empty-state-desc">Try a different search term</div>
  </div>
)

interface ChannelLogoProps {
  logo: string | undefined
  name: string
}

const ChannelLogo: React.FC<ChannelLogoProps> = ({ logo, name }) => {
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none"
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null
    if (placeholder) placeholder.style.display = "flex"
  }

  return (
    <div className="channel-logo-wrap">
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} onError={handleImgError} />
      )}
      <div
        className="channel-logo-placeholder"
        style={{ display: logo ? "none" : "flex" }}
      >
        <Tv size={12} />
      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  currentChannel,
  isLoading = false,
  favoriteUrls,
  onChannelSelect,
  onToggleFavorite,
}) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: channels.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 10,
  })

  if (isLoading) return <LoadingState />
  if (channels.length === 0) return <EmptyState />

  return (
    <div ref={parentRef} className="channel-list" style={{ flex: 1, overflow: "auto" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const channel = channels[virtualRow.index]
          const isActive = currentChannel?.url === channel.url
          const isFav = favoriteUrls?.has(channel.url) ?? false

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className={`channel-item${isActive ? " active" : ""}`}
              onClick={() => onChannelSelect(channel)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <span className="channel-num">{virtualRow.index + 1}.</span>
              <ChannelLogo logo={channel.logo} name={channel.name} />
              <span className="channel-name-text">{channel.name}</span>

              {/* Favorite toggle — only rendered when the feature is enabled */}
              {onToggleFavorite && (
                <button
                  className="channel-fav-btn"
                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  aria-label={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  aria-pressed={isFav}
                  onClick={(e) => {
                    e.stopPropagation() // don't trigger channel selection
                    onToggleFavorite(channel)
                  }}
                >
                  <Star
                    size={13}
                    fill={isFav ? "currentColor" : "none"}
                    style={{ color: isFav ? "oklch(0.80 0.20 55)" : undefined }}
                  />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
