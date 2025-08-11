import React from "react"
import { Channel } from "@/types/iptv"
import { TvScreen } from "./TvScreen"
import { TvControls } from "./TvControls"

interface TvPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isTvOn: boolean
  isLoading: boolean
  currentChannel: Channel | null
  videoError: string | null
  isMuted: boolean
  videoReady: boolean
  onPowerOn: () => void
  onToggleTv: () => void
  onToggleMute: () => void
  onRetry: () => void
  onManualPlay: () => void
}

export const TvPlayer: React.FC<TvPlayerProps> = ({
  videoRef,
  isTvOn,
  isLoading,
  currentChannel,
  videoError,
  isMuted,
  videoReady,
  onPowerOn,
  onToggleTv,
  onToggleMute,
  onRetry,
  onManualPlay
}) => {
  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 shadow-xl p-4">
        <TvScreen
          isTvOn={isTvOn}
          isLoading={isLoading}
          currentChannel={currentChannel}
          videoError={videoError}
          onPowerOn={onPowerOn}
          onRetry={onRetry}
        >
          <video 
            ref={videoRef} 
            className="w-full h-full object-contain" 
            controls={false} 
            autoPlay 
            playsInline
            muted={isMuted}
            crossOrigin="anonymous"
          />
        </TvScreen>
      </div>

      <div className="flex-shrink-0 mt-4">
        <TvControls
          isTvOn={isTvOn}
          isMuted={isMuted}
          videoReady={videoReady}
          onToggleTv={onToggleTv}
          onToggleMute={onToggleMute}
          onFullscreen={handleFullscreen}
          onManualPlay={onManualPlay}
        />
      </div>
    </div>
  )
}
