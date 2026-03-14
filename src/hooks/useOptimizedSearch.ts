import { useState, useEffect, useMemo, useCallback } from "react"
import { filterChannels, createSearchIndex, searchWithIndex } from "@/utils/m3u-parser"
import type { Channel } from "@/types/iptv"

// ── Types ────────────────────────────────────────────────────────────────────

export interface OptimizedSearchOptions {
  /** Milliseconds to debounce query updates. Default: 300 */
  debounceMs?: number
  /** Use an inverted index for large lists. Default: true */
  useIndexing?: boolean
}

export interface OptimizedSearchResult {
  searchQuery: string
  filteredChannels: Channel[]
  /** True while the debounce timer is pending */
  isSearching: boolean
  updateSearchQuery: (query: string) => void
  clearSearch: () => void
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useOptimizedSearch(
  channels: Channel[],
  { debounceMs = 300, useIndexing = true }: OptimizedSearchOptions = {}
): OptimizedSearchResult {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Build inverted index for channels > 100 to speed up repeated queries
  const searchIndex = useMemo(() => {
    return useIndexing && channels.length > 100 ? createSearchIndex(channels) : null
  }, [channels, useIndexing])

  // Debounce: update committed query after idle period
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), debounceMs)
    return () => clearTimeout(timer)
  }, [searchQuery, debounceMs])

  // Derive the filtered list from the committed query; returns full list when empty
  const filteredChannels = useMemo<Channel[]>(() => {
    if (!debouncedQuery.trim()) return channels
    return searchIndex
      ? searchWithIndex(channels, searchIndex, debouncedQuery)
      : filterChannels(channels, debouncedQuery)
  }, [channels, debouncedQuery, searchIndex])

  const updateSearchQuery = useCallback((query: string) => setSearchQuery(query), [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setDebouncedQuery("")
  }, [])

  return {
    searchQuery,
    filteredChannels,
    isSearching: searchQuery !== debouncedQuery,
    updateSearchQuery,
    clearSearch,
  }
}
