import React, { useState } from "react"
import { FileUpload } from "./FileUpload"
import { PlaylistSelector } from "./PlaylistSelector"
import { TvPlayer } from "../tv/TvPlayer"
import { ChannelGrid } from "../channels/ChannelGrid"
import { useVideoPlayer } from "@/hooks/useVideoPlayer"
import { useChannels } from "@/hooks/useChannels"
import { Channel, Playlist } from "@/types/iptv"
import { Button } from "@/components/ui/button"
import { Upload, List } from "lucide-react"

export const IptvApp: React.FC = () => {
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(true)
  
  const {
    videoRef,
    isLoading,
    isTvOn,
    isMuted,
    videoError,
    videoReady,
    playChannel,
    toggleMute,
    toggleTv,
    turnOnTv,
    setVideoError
  } = useVideoPlayer()

  const {
    channels,
    currentChannel,
    selectedPlaylist,
    loadingPlaylist,
    playlistError,
    searchQuery,
    filteredChannels,
    isSearching,
    fileInputRef,
    handleFileUpload,
    loadPlaylistFromUrl,
    selectChannel,
    updateSearchQuery,
    triggerFileUpload
  } = useChannels()

  const handleChannelSelect = (channel: Channel) => {
    selectChannel(channel)
    playChannel(channel)
  }

  const handlePlaylistSelect = (playlist: Playlist) => {
    loadPlaylistFromUrl(playlist)
    setShowPlaylistSelector(false)
  }

  const handleRetry = () => {
    setVideoError(null)
  }

  const handleManualPlay = async () => {
    // Video.js handles autoplay automatically
    console.log("Manual play requested")
  }

  return (
    <div className="h-screen bg-black text-green-400 font-mono flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 overflow-hidden">
        {/* CRT TV Player */}
        <div className="lg:col-span-2 overflow-hidden flex flex-col">
                     <TvPlayer
             videoRef={videoRef}
             isTvOn={isTvOn}
             isLoading={isLoading}
             currentChannel={currentChannel}
             videoError={videoError}
             isMuted={isMuted}
             videoReady={videoReady}
             onPowerOn={turnOnTv}
             onToggleTv={toggleTv}
             onToggleMute={toggleMute}
             onRetry={handleRetry}
             onManualPlay={handleManualPlay}
           />
          
          {/* File Upload and Playlist Info */}
          <div className="flex flex-col items-center mt-4 space-y-2">
            {/* Current Playlist Info */}
            {selectedPlaylist && (
              <div className="text-center">
                <p className="text-green-400 font-mono text-sm">
                  📺 {selectedPlaylist.name} ({selectedPlaylist.count} channels)
                </p>
                {playlistError && (
                  <p className="text-red-400 font-mono text-xs mt-1">
                    Error: {playlistError}
                  </p>
                )}
                {loadingPlaylist && (
                  <p className="text-green-400 font-mono text-xs mt-1">
                    Loading playlist...
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {channels.length > 0 && (
                <Button
                  onClick={() => setShowPlaylistSelector(!showPlaylistSelector)}
                  className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <List className="w-4 h-4 mr-2" />
                  {showPlaylistSelector ? "HIDE PLAYLISTS" : "CHOOSE PLAYLIST"}
                </Button>
              )}
              
              <Button
                onClick={triggerFileUpload}
                className="bg-green-600 hover:bg-green-700 text-white border border-green-500 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
              >
                <Upload className="w-4 h-4 mr-2" />
                UPLOAD FILE
              </Button>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              accept=".m3u,.m3u8" 
              onChange={handleFileUpload} 
              ref={fileInputRef} 
              className="hidden" 
            />
          </div>
        </div>

        {/* Right Panel - Playlist Selector or Channel Grid */}
        <div className="overflow-hidden">
          {showPlaylistSelector || channels.length === 0 ? (
            <PlaylistSelector
              onPlaylistSelect={handlePlaylistSelect}
              selectedPlaylistId={selectedPlaylist?.id}
            />
          ) : (
                         <ChannelGrid
               channels={channels}
               filteredChannels={filteredChannels}
               currentChannel={currentChannel}
               searchQuery={searchQuery}
               isSearching={isSearching}
               isLoading={loadingPlaylist}
               onChannelSelect={handleChannelSelect}
               onSearchChange={updateSearchQuery}
             />
          )}
        </div>
      </div>
    </div>
  )
}
