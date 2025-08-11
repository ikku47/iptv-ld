import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Playlist } from "@/types/iptv"
import { Globe, Languages, FolderOpen, Flag, Loader2 } from "lucide-react"

interface PlaylistSelectorProps {
  onPlaylistSelect: (playlist: Playlist) => void
  selectedPlaylistId?: string
}

const IPTV_ORG_PLAYLISTS: Playlist[] = [
  {
    id: "language",
    name: "Language-based Channels",
    description: "Channels organized by language (English, Spanish, French, etc.)",
    url: "https://iptv-org.github.io/iptv/index.language.m3u",
    type: "language",
    language: "All Languages"
  },
  {
    id: "category", 
    name: "Category-based Channels",
    description: "Channels organized by category (News, Sports, Entertainment, etc.)",
    url: "https://iptv-org.github.io/iptv/index.category.m3u",
    type: "category",
    category: "All Categories"
  },
  {
    id: "country",
    name: "Country-based Channels", 
    description: "Channels organized by country (USA, UK, Germany, etc.)",
    url: "https://iptv-org.github.io/iptv/index.country.m3u",
    type: "country",
    country: "All Countries"
  }
]

const getPlaylistIcon = (type: Playlist['type']) => {
  switch (type) {
    case 'language':
      return <Languages className="w-5 h-5" />
    case 'category':
      return <FolderOpen className="w-5 h-5" />
    case 'country':
      return <Flag className="w-5 h-5" />
    default:
      return <Globe className="w-5 h-5" />
  }
}

export const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
  onPlaylistSelect,
  selectedPlaylistId
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handlePlaylistClick = async (playlist: Playlist) => {
    setLoadingStates(prev => ({ ...prev, [playlist.id]: true }))
    
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      onPlaylistSelect(playlist)
    } catch (error) {
      console.error("Error selecting playlist:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, [playlist.id]: false }))
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-green-400 font-mono">
          📺 IPTV Playlists
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Choose from curated IPTV-org playlists
        </p>
      </div>

      {/* Playlist Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {IPTV_ORG_PLAYLISTS.map((playlist) => {
          const isLoading = loadingStates[playlist.id]
          const isSelected = selectedPlaylistId === playlist.id

          return (
            <Card 
              key={playlist.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'border-green-500 bg-green-500/10 shadow-green-500/20' 
                  : 'border-gray-700 hover:border-green-500/50 hover:bg-gray-800/50'
              }`}
              onClick={() => !isLoading && handlePlaylistClick(playlist)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {getPlaylistIcon(playlist.type)}
                    </div>
                    <div>
                      <CardTitle className={`text-lg font-mono ${
                        isSelected ? 'text-green-400' : 'text-white'
                      }`}>
                        {playlist.name}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        {playlist.description}
                      </p>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                  ) : (
                    <Button
                      size="sm"
                      className={`${
                        isSelected 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      } transition-colors`}
                    >
                      {isSelected ? 'LOADED' : 'LOAD'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-mono">
                    {playlist.type.toUpperCase()} PLAYLIST
                  </span>
                  <span className="text-green-400 font-mono">
                    {playlist.url.includes('iptv-org.github.io') ? 'IPTV-ORG' : 'EXTERNAL'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="text-center">
          <p className="text-gray-400 text-xs font-mono">
            Powered by <a 
              href="https://github.com/iptv-org/iptv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 underline"
            >
              IPTV-org
            </a>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Free and open-source IPTV playlists
          </p>
        </div>
      </div>
    </div>
  )
}
