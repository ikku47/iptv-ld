import { Channel } from "@/types/iptv"

// Helper function to extract attributes from EXTINF line
const extractAttribute = (info: string, attribute: string): string | undefined => {
  const regex = new RegExp(`${attribute}="([^"]+)"`)
  const match = info.match(regex)
  return match ? match[1] : undefined
}

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split("\n")
  const channels: Channel[] = []
  let currentChannel: Partial<Channel> = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith("#EXTINF:")) {
      // Parse channel info
      const infoMatch = line.match(/#EXTINF:(-?\d+)\s*(.*)/)
      if (infoMatch) {
        const [, duration, info] = infoMatch
        
        // Extract channel name (everything after the last comma)
        const lastCommaIndex = info.lastIndexOf(',')
        const channelName = lastCommaIndex !== -1 ? info.substring(lastCommaIndex + 1).trim() : info.trim()
        
        // Clean up channel name (remove quality indicators in parentheses)
        const cleanName = channelName.replace(/\s*\(\d+p?\)\s*$/, '').trim()
        
        currentChannel = {
          name: cleanName,
          group: extractAttribute(info, 'group-title'),
          logo: extractAttribute(info, 'tvg-logo'),
          tvgId: extractAttribute(info, 'tvg-id'),
          tvgName: extractAttribute(info, 'tvg-name'),
          tvgLogo: extractAttribute(info, 'tvg-logo'),
          tvgGroup: extractAttribute(info, 'group-title'),
          tvgUrl: extractAttribute(info, 'tvg-url'),
          epgUrl: extractAttribute(info, 'epg-url'),
          catchup: extractAttribute(info, 'catchup'),
          catchupDays: extractAttribute(info, 'catchup-days'),
          catchupSource: extractAttribute(info, 'catchup-source'),
          timeshift: extractAttribute(info, 'timeshift'),
          aspectRatio: extractAttribute(info, 'aspect-ratio'),
          audioTrack: extractAttribute(info, 'audio-track'),
          subtitleTrack: extractAttribute(info, 'subtitle-track'),
          quality: extractAttribute(info, 'quality'),
          resolution: extractAttribute(info, 'resolution'),
          frameRate: extractAttribute(info, 'frame-rate'),
          bitrate: extractAttribute(info, 'bitrate'),
          codec: extractAttribute(info, 'codec'),
          language: extractAttribute(info, 'language'),
          country: extractAttribute(info, 'country'),
          category: extractAttribute(info, 'category'),
          region: extractAttribute(info, 'region'),
          timezone: extractAttribute(info, 'timezone'),
          geoBlocked: info.includes('[Geo-blocked]'),
          not24_7: info.includes('[Not 24/7]')
        }
      }
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      // This is the URL line
      currentChannel.url = line.trim()
      
      // Only add channels with valid URLs
      if (currentChannel.url && (currentChannel.url.startsWith('http') || currentChannel.url.startsWith('https'))) {
        channels.push(currentChannel as Channel)
      }
      
      currentChannel = {}
    }
  }

  return channels
}

export const getStreamType = (url: string): string => {
  if (url.includes('.m3u8')) return 'HLS'
  if (url.includes('.mp4')) return 'MP4'
  if (url.includes('.ts')) return 'TS'
  if (url.includes('.flv')) return 'FLV'
  return 'Stream'
}

// Optimized search with partial matching and debouncing
export const filterChannels = (channels: Channel[], searchQuery: string): Channel[] => {
  if (!searchQuery.trim()) return channels
  
  const query = searchQuery.toLowerCase().trim()
  
  return channels.filter(channel => {
    const name = channel.name.toLowerCase()
    const group = channel.group?.toLowerCase() || ''
    
    // Check if query is found anywhere in name or group (partial matching)
    return name.includes(query) || group.includes(query)
  })
}

// Fast search for large channel lists with indexing
export const createSearchIndex = (channels: Channel[]) => {
  const index = new Map<string, Set<number>>()
  
  channels.forEach((channel, idx) => {
    const name = channel.name.toLowerCase()
    const group = channel.group?.toLowerCase() || ''
    
    // Index by words in name
    name.split(/\s+/).forEach(word => {
      if (word.length > 0) {
        if (!index.has(word)) index.set(word, new Set())
        index.get(word)!.add(idx)
      }
    })
    
    // Index by words in group
    group.split(/\s+/).forEach(word => {
      if (word.length > 0) {
        if (!index.has(word)) index.set(word, new Set())
        index.get(word)!.add(idx)
      }
    })
  })
  
  return index
}

export const searchWithIndex = (
  channels: Channel[], 
  searchIndex: Map<string, Set<number>>, 
  searchQuery: string
): Channel[] => {
  if (!searchQuery.trim()) return channels
  
  const query = searchQuery.toLowerCase().trim()
  
  // For partial matching, we need to check all indexed words that contain the query
  const matchingIndices = new Set<number>()
  
  for (const [word, indices] of searchIndex.entries()) {
    if (word.includes(query)) {
      indices.forEach(idx => matchingIndices.add(idx))
    }
  }
  
  return Array.from(matchingIndices).map(idx => channels[idx])
}
