import React from "react"
import { Card } from "@/components/ui/card"
import { Tv } from "lucide-react"
import { Channel } from "@/types/iptv"
import { getStreamType } from "@/utils/m3u-parser"

interface ChannelCardProps {
  channel: Channel
  isActive: boolean
  onClick: (channel: Channel) => void
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isActive,
  onClick
}) => {
  return (
    <Card
      className={`p-2.5 bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-lg cursor-pointer transition-all duration-200 hover:border-green-500/70 hover:bg-gray-800 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-0.5 ${
        isActive ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20 ring-1 ring-green-500/30" : ""
      }`}
      onClick={() => onClick(channel)}
    >
      <div className="flex items-center gap-2.5">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-8 h-8 object-cover rounded border border-gray-600/50 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        ) : (
          <div className="w-8 h-8 bg-gray-700/50 rounded border border-gray-600/50 flex items-center justify-center text-gray-500 flex-shrink-0">
            <Tv className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-green-400 font-medium text-sm truncate leading-tight">{channel.name}</div>
          <div className="flex items-center gap-1.5 mt-1">
            {channel.group && (
              <span className="text-gray-400 text-xs truncate bg-gray-700/50 px-1.5 py-0.5 rounded">
                {channel.group}
              </span>
            )}
            <span className="bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded font-mono border border-green-500/30">
              {getStreamType(channel.url)}
            </span>
          </div>
        </div>
        {isActive && (
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse"></div>
        )}
      </div>
    </Card>
  )
}
