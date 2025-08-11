import React from "react"
import { Upload } from "lucide-react"
import { Channel } from "@/types/iptv"
import { ChannelCard } from "./ChannelCard"
import { ChannelSearch } from "./ChannelSearch"

interface ChannelGridProps {
  channels: Channel[]
  filteredChannels: Channel[]
  currentChannel: Channel | null
  searchQuery: string
  isSearching?: boolean
  isLoading?: boolean
  onChannelSelect: (channel: Channel) => void
  onSearchChange: (query: string) => void
  onClearSearch?: () => void
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  filteredChannels,
  currentChannel,
  searchQuery,
  isSearching = false,
  isLoading = false,
  onChannelSelect,
  onSearchChange,
  onClearSearch
}) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-card to-card/50 rounded-xl border border-border shadow-xl">
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary glow-text font-mono">CHANNELS</h2>
            <div className="text-sm text-muted-foreground font-mono">
              {filteredChannels.length} of {channels.length} available
              {searchQuery && (
                <span className="text-primary ml-2">
                  • "{searchQuery}"
                </span>
              )}
            </div>
          </div>
          {currentChannel && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-mono">NOW PLAYING</div>
              <div className="text-sm text-primary font-medium truncate max-w-32">
                {currentChannel.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {channels.length > 0 && (
        <div className="flex-shrink-0 p-4">
          <ChannelSearch
            searchQuery={searchQuery}
            isSearching={isSearching}
            onSearchChange={onSearchChange}
            onClear={onClearSearch}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-lg mb-2 text-muted-foreground">LOADING CHANNELS</div>
              <div className="text-sm text-muted-foreground/70">Please wait...</div>
            </div>
          </div>
        ) : channels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <div className="text-lg mb-2 text-muted-foreground">NO PLAYLIST LOADED</div>
              <div className="text-sm text-muted-foreground/70">Upload an M3U file to begin</div>
            </div>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-lg mb-2 text-muted-foreground">NO CHANNELS FOUND</div>
              <div className="text-sm text-muted-foreground/70">Try adjusting your search</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
            {filteredChannels.map((channel, index) => (
              <ChannelCard
                key={`${channel.url}-${index}`}
                channel={channel}
                isActive={currentChannel?.url === channel.url}
                onClick={onChannelSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
