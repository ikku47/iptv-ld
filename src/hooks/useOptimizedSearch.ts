import { useState, useEffect, useMemo, useCallback } from "react"
import { Channel } from "@/types/iptv"
import { filterChannels, createSearchIndex, searchWithIndex } from "@/utils/m3u-parser"

interface UseOptimizedSearchOptions {
  debounceMs?: number
  useIndexing?: boolean
  maxResults?: number
}

export const useOptimizedSearch = (
  channels: Channel[], 
  options: UseOptimizedSearchOptions = {}
) => {
  const { 
    debounceMs = 300, 
    useIndexing = true, 
    maxResults = 100 
  } = options

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Create search index for fast lookup
  const searchIndex = useMemo(() => {
    if (useIndexing && channels.length > 100) {
      return createSearchIndex(channels)
    }
    return null
  }, [channels, useIndexing])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchQuery, debounceMs])

  // Filter channels based on search method
  const filteredChannels = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return channels.slice(0, maxResults)
    }

    let results: Channel[]
    
    if (searchIndex && useIndexing) {
      results = searchWithIndex(channels, searchIndex, debouncedQuery)
    } else {
      results = filterChannels(channels, debouncedQuery)
    }

    // Limit results for performance
    return results.slice(0, maxResults)
  }, [channels, debouncedQuery, searchIndex, useIndexing, maxResults])

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    setDebouncedQuery("")
  }, [])

  return {
    searchQuery,
    debouncedQuery,
    filteredChannels,
    updateSearchQuery,
    clearSearch,
    isSearching: searchQuery !== debouncedQuery
  }
}
