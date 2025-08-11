import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Playlist } from "@/types/iptv"
import { Globe, Languages, FolderOpen, Flag, Loader2, ExternalLink, CheckCircle, Play } from "lucide-react"

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
      return <Languages className="w-6 h-6" />
    case 'category':
      return <FolderOpen className="w-6 h-6" />
    case 'country':
      return <Flag className="w-6 h-6" />
    default:
      return <Globe className="w-6 h-6" />
  }
}

const getPlaylistColor = (type: Playlist['type']) => {
  switch (type) {
    case 'language':
      return 'from-blue-500/20 to-purple-500/20 border-blue-500/30'
    case 'category':
      return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
    case 'country':
      return 'from-orange-500/20 to-red-500/20 border-orange-500/30'
    default:
      return 'from-gray-500/20 to-slate-500/20 border-gray-500/30'
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
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border shadow-xl">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border/50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground font-mono mb-2">
            IPTV Playlists
          </h2>
          <p className="text-muted-foreground text-sm">
            Choose from curated IPTV-org playlists
          </p>
        </div>
      </div>

      {/* Playlist Grid */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {IPTV_ORG_PLAYLISTS.map((playlist) => {
          const isLoading = loadingStates[playlist.id]
          const isSelected = selectedPlaylistId === playlist.id
          const colorClass = getPlaylistColor(playlist.type)

          return (
            <Card 
              key={playlist.id}
              className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                isSelected 
                  ? `bg-gradient-to-r ${colorClass} shadow-lg shadow-primary/20 border-primary` 
                  : 'bg-card/50 hover:bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
              }`}
              onClick={() => !isLoading && handlePlaylistClick(playlist)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected 
                        ? 'bg-primary/20 text-primary shadow-lg shadow-primary/20' 
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors'
                    }`}>
                      {getPlaylistIcon(playlist.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className={`text-lg font-semibold mb-2 ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {playlist.name}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {playlist.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {playlist.type.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          IPTV-ORG
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : isSelected ? (
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">LOADED</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        LOAD
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">
                    {playlist.url.includes('iptv-org.github.io') ? 'Official IPTV-org' : 'External Source'}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="flex-shrink-0 p-6 border-t border-border/50 bg-muted/20">
        <div className="text-center">
          <p className="text-muted-foreground text-sm font-medium mb-1">
            Powered by{" "}
            <a 
              href="https://github.com/iptv-org/iptv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              IPTV-org
            </a>
          </p>
          <p className="text-muted-foreground/70 text-xs">
            Free and open-source IPTV playlists
          </p>
        </div>
      </div>
    </div>
  )
}
