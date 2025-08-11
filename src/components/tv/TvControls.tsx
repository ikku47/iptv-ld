import React from "react"
import { Button } from "@/components/ui/button"
import { Power, Volume2, VolumeX, Maximize } from "lucide-react"

interface TvControlsProps {
  isMuted: boolean
  videoReady: boolean
  onToggleTv: () => void
  onToggleMute: () => void
  onFullscreen: () => void
  onManualPlay: () => void
}

export const TvControls: React.FC<TvControlsProps> = ({
  isMuted,
  videoReady,
  onToggleTv,
  onToggleMute,
  onFullscreen,
  onManualPlay
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center gap-3">
        <Button 
          onClick={onToggleTv} 
          className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-green-400 hover:text-green-300 transition-all duration-200" 
          size="sm"
        >
          <Power className="w-4 h-4" />
        </Button>
        <Button 
          onClick={onToggleMute} 
          className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-green-400 hover:text-green-300 transition-all duration-200" 
          size="sm"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>

        <Button 
          onClick={onFullscreen} 
          className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-green-400 hover:text-green-300 transition-all duration-200" 
          size="sm"
        >
          <Maximize className="w-4 h-4" />
        </Button>
        <Button 
          onClick={onManualPlay} 
          className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-green-400 hover:text-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
          size="sm"
          disabled={!videoReady}
        >
          ▶
        </Button>
      </div>
    </div>
  )
}
