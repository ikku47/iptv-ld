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
      className={`p-2.5 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/70 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 ${
        isActive ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-1 ring-primary/30" : ""
      }`}
      onClick={() => onClick(channel)}
    >
      <div className="flex items-center gap-2.5">
        {channel.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-8 h-8 object-cover rounded border border-border/50 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        ) : (
          <div className="w-8 h-8 bg-muted/50 rounded border border-border/50 flex items-center justify-center text-muted-foreground flex-shrink-0">
            <Tv className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-primary font-medium text-sm truncate leading-tight">{channel.name}</div>
          <div className="flex items-center gap-1.5 mt-1">
            {channel.group && (
              <span className="text-muted-foreground text-xs truncate bg-muted/50 px-1.5 py-0.5 rounded">
                {channel.group}
              </span>
            )}
            <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded font-mono border border-primary/30">
              {getStreamType(channel.url)}
            </span>
          </div>
        </div>
        {isActive && (
          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse"></div>
        )}
      </div>
    </Card>
  )
}
