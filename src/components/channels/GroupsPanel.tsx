"use client"

import React, { useState, useRef, useCallback, useMemo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ChevronRight, Languages, FolderOpen, Flag, Tv, Loader2, Star } from "lucide-react"
import { parseM3U } from "@/utils/m3u-parser"
import type { Channel } from "@/types/iptv"

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 44 // px

// ── Types ────────────────────────────────────────────────────────────────────

type Step = "type" | "groups" | "channels"

interface PlaylistType {
  id: string
  label: string
  url: string
  icon: React.ReactNode
  accent: string
}

export interface GroupsPanelProps {
  currentChannel: Channel | null
  /** Set of favorite URLs for O(1) lookup */
  favoriteUrls: Set<string>
  onChannelSelect: (channel: Channel) => void
  onToggleFavorite: (channel: Channel) => void
}

// ── Configuration ─────────────────────────────────────────────────────────────

const PLAYLIST_TYPES: PlaylistType[] = [
  {
    id: "language",
    label: "Language",
    url: "https://iptv-org.github.io/iptv/index.language.m3u",
    icon: <Languages size={20} />,
    accent: "oklch(0.60 0.18 260)",
  },
  {
    id: "category",
    label: "Category",
    url: "https://iptv-org.github.io/iptv/index.category.m3u",
    icon: <FolderOpen size={20} />,
    accent: "oklch(0.60 0.18 160)",
  },
  {
    id: "country",
    label: "Country",
    url: "https://iptv-org.github.io/iptv/index.country.m3u",
    icon: <Flag size={20} />,
    accent: "oklch(0.60 0.18 50)",
  },
]

// ── Virtualised list ──────────────────────────────────────────────────────────

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
}

function VirtualList<T,>({ items, renderItem, emptyMessage = "Nothing here" }: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 10,
  })

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-desc">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div ref={parentRef} style={{ flex: 1, overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
        {virtualizer.getVirtualItems().map((vRow) => (
          <div
            key={vRow.key}
            data-index={vRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${vRow.start}px)`,
            }}
          >
            {renderItem(items[vRow.index], vRow.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Channel logo ──────────────────────────────────────────────────────────────

const ChannelLogo: React.FC<{ logo: string | undefined; name: string }> = ({ logo, name }) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none"
    const el = e.currentTarget.nextElementSibling as HTMLElement | null
    if (el) el.style.display = "flex"
  }
  return (
    <div className="channel-logo-wrap">
      {logo && <img src={logo} alt={name} onError={handleError} />}  {/* eslint-disable-line @next/next/no-img-element */}
      <div className="channel-logo-placeholder" style={{ display: logo ? "none" : "flex" }}>
        <Tv size={12} />
      </div>
    </div>
  )
}

// ── GroupsPanel ───────────────────────────────────────────────────────────────

export const GroupsPanel: React.FC<GroupsPanelProps> = ({
  currentChannel,
  favoriteUrls,
  onChannelSelect,
  onToggleFavorite,
}) => {
  const [step, setStep] = useState<Step>("type")
  const [selectedType, setSelectedType] = useState<PlaylistType | null>(null)
  const [allChannels, setAllChannels] = useState<Channel[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // ── Derived data ────────────────────────────────────────────────────────────

  const groups = useMemo<string[]>(() => {
    const seen = new Set<string>()
    allChannels.forEach((ch) => { if (ch.group) seen.add(ch.group) })
    return Array.from(seen).sort((a, b) => a.localeCompare(b))
  }, [allChannels])

  const groupCounts = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    allChannels.forEach((ch) => {
      if (ch.group) map[ch.group] = (map[ch.group] ?? 0) + 1
    })
    return map
  }, [allChannels])

  const filteredGroups = useMemo<string[]>(() => {
    const q = searchQuery.trim().toLowerCase()
    return q ? groups.filter((g) => g.toLowerCase().includes(q)) : groups
  }, [groups, searchQuery])

  const groupChannels = useMemo<Channel[]>(() => {
    if (!selectedGroup) return []
    const q = searchQuery.trim().toLowerCase()
    const base = allChannels.filter((ch) => ch.group === selectedGroup)
    return q ? base.filter((ch) => ch.name.toLowerCase().includes(q)) : base
  }, [allChannels, selectedGroup, searchQuery])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleTypeSelect = useCallback(async (type: PlaylistType) => {
    setSelectedType(type)
    setIsLoading(true)
    setAllChannels([])
    setSelectedGroup(null)
    setSearchQuery("")

    try {
      const res = await fetch(type.url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      setAllChannels(parseM3U(text))
      setStep("groups")
    } catch (err) {
      console.error("[GroupsPanel] Failed to load playlist:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleGroupSelect = useCallback((group: string) => {
    setSelectedGroup(group)
    setSearchQuery("")
    setStep("channels")
  }, [])

  const goToTypeStep = useCallback(() => {
    setStep("type")
    setSelectedType(null)
    setAllChannels([])
    setSelectedGroup(null)
    setSearchQuery("")
  }, [])

  const goToGroupsStep = useCallback(() => {
    setStep("groups")
    setSelectedGroup(null)
    setSearchQuery("")
  }, [])

  // ── Shared render helpers ────────────────────────────────────────────────────

  const renderBreadcrumb = () => {
    if (step === "type") return null
    return (
      <nav
        aria-label="breadcrumb"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "7px 12px",
          borderBottom: "1px solid var(--border)",
          fontSize: 11,
          color: "var(--muted-foreground)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={goToTypeStep}
          style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 11, padding: 0 }}
        >
          Type
        </button>

        {step === "channels" && (
          <>
            <ChevronRight size={12} style={{ opacity: 0.5 }} />
            <button
              onClick={goToGroupsStep}
              style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 11, padding: 0 }}
            >
              {selectedType?.label}
            </button>
          </>
        )}

        <ChevronRight size={12} style={{ opacity: 0.5 }} />
        <span style={{ color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {step === "groups" ? selectedType?.label : selectedGroup}
        </span>
      </nav>
    )
  }

  const renderSearchBar = (placeholder: string) => (
    <div className="sidebar-search">
      <input
        className="sidebar-search-input"
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button className="sidebar-upload-btn" onClick={() => setSearchQuery("")} title="Clear search">
          ✕
        </button>
      )}
    </div>
  )

  // ── Step renderers ───────────────────────────────────────────────────────────

  const renderTypeStep = () => (
    <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", color: "var(--muted-foreground)", textTransform: "uppercase", margin: "0 0 4px" }}>
        Select Type
      </p>
      {PLAYLIST_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => handleTypeSelect(type)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "12px 14px",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s, background 0.15s",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = type.accent
            e.currentTarget.style.background = "var(--secondary)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)"
            e.currentTarget.style.background = "var(--card)"
          }}
        >
          <span style={{ color: type.accent, flexShrink: 0 }}>{type.icon}</span>
          <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <strong style={{ display: "block", fontSize: 13, color: "var(--foreground)" }}>{type.label}</strong>
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Browse by {type.label.toLowerCase()}</span>
          </span>
          <ChevronRight size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        </button>
      ))}
    </div>
  )

  const renderGroupsStep = () => {
    if (isLoading) {
      return (
        <div className="empty-state">
          <Loader2 size={28} style={{ color: "var(--primary)", animation: "spin 0.8s linear infinite" }} />
          <div className="empty-state-desc">Loading {selectedType?.label} channels…</div>
        </div>
      )
    }

    return (
      <>
        {renderSearchBar("Filter groups…")}
        <VirtualList
          items={filteredGroups}
          emptyMessage={searchQuery ? "No matching groups" : "No groups found"}
          renderItem={(group) => (
            <div
              className="channel-item"
              onClick={() => handleGroupSelect(group)}
              style={{ justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: selectedType?.accent ?? "var(--primary)", flexShrink: 0 }} />
                <span className="channel-name-text">{group}</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0, background: "var(--secondary)", padding: "1px 6px", borderRadius: 3 }}>
                {groupCounts[group] ?? 0}
              </span>
            </div>
          )}
        />
      </>
    )
  }

  const renderChannelsStep = () => (
    <>
      {renderSearchBar("Search channels…")}
      <VirtualList
        items={groupChannels}
        emptyMessage={searchQuery ? "No matching channels" : "No channels in this group"}
        renderItem={(channel, i) => {
          const isFav = favoriteUrls.has(channel.url)
          return (
            <div
              className={`channel-item${currentChannel?.url === channel.url ? " active" : ""}`}
              onClick={() => onChannelSelect(channel)}
            >
              <span className="channel-num">{i + 1}.</span>
              <ChannelLogo logo={channel.logo} name={channel.name} />
              <span className="channel-name-text">{channel.name}</span>
              <button
                className="channel-fav-btn"
                title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                aria-pressed={isFav}
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(channel) }}
              >
                <Star
                  size={13}
                  fill={isFav ? "currentColor" : "none"}
                  style={{ color: isFav ? "oklch(0.80 0.20 55)" : undefined }}
                />
              </button>
            </div>
          )
        }}
      />
    </>
  )

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {renderBreadcrumb()}
      {step === "type" && renderTypeStep()}
      {step === "groups" && renderGroupsStep()}
      {step === "channels" && renderChannelsStep()}
    </div>
  )
}
