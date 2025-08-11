import React from "react"
import { Power, Tv } from "lucide-react"
import { Channel } from "@/types/iptv"

interface TvScreenProps {
  isTvOn: boolean
  isLoading: boolean
  currentChannel: Channel | null
  videoError: string | null
  onPowerOn: () => void
  onRetry: () => void
  children: React.ReactNode
}

export const TvScreen: React.FC<TvScreenProps> = ({
  isTvOn,
  isLoading,
  currentChannel,
  videoError,
  onPowerOn,
  onRetry,
  children
}) => {
  return (
    <div className="h-full w-full relative bg-black rounded-lg overflow-hidden">
      {/* Always render video element */}
      <div className={`w-full h-full ${!isTvOn || !currentChannel ? 'hidden' : ''}`}>
        {children}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-green-500/10 to-transparent"></div>
        {currentChannel && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-green-500/50">
            <div className="text-green-400 font-bold text-sm">{currentChannel.name}</div>
            {currentChannel.group && <div className="text-green-400/70 text-xs">{currentChannel.group}</div>}
          </div>
        )}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center">
              <div className="text-red-400 mb-4">{videoError}</div>
              <button 
                onClick={onRetry} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TV Off Screen */}
      {!isTvOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center cursor-pointer" onClick={onPowerOn}>
            <Power className="w-12 h-12 mx-auto text-gray-500 hover:text-green-400 transition-colors" />
            <div className="text-sm mt-2 text-gray-500">POWER ON</div>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {isTvOn && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="text-2xl mb-4 text-green-400">TUNING...</div>
            <div className="flex gap-1 justify-center">
              <div className="w-2 h-6 bg-green-400 animate-pulse"></div>
              <div className="w-2 h-6 bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-6 bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-2 h-6 bg-green-400 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
              <div className="w-2 h-6 bg-green-400 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* No Signal Screen */}
      {isTvOn && !isLoading && !currentChannel && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <Tv className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <div className="text-xl text-gray-400">NO SIGNAL</div>
            <div className="text-sm mt-2 text-gray-500">SELECT A CHANNEL</div>
          </div>
        </div>
      )}
    </div>
  )
}
