import React, { useState } from "react"
import { ChevronLeft, ChevronRight, Tv } from "lucide-react"
import { Channel } from "@/types/iptv"

interface EpgPanelProps {
  currentChannel: Channel | null
}

// Generate mock EPG-style programs for demo purposes
function generatePrograms(date: Date) {
  const programs = [
    { start: "00:00", end: "01:00", title: "Overnight Programming" },
    { start: "01:00", end: "03:00", title: "Night Edition" },
    { start: "03:00", end: "05:00", title: "Early Morning Show" },
    { start: "05:00", end: "06:30", title: "Morning Brief" },
    { start: "06:30", end: "07:00", title: "World Report" },
    { start: "07:00", end: "08:00", title: "Morning News" },
    { start: "08:00", end: "09:00", title: "Business Today" },
    { start: "09:00", end: "09:30", title: "Market Update" },
    { start: "09:30", end: "10:00", title: "Documentary" },
    { start: "10:00", end: "10:30", title: "Midday News" },
    { start: "10:30", end: "11:00", title: "Current Affairs" },
    { start: "11:00", end: "11:30", title: "Special Report" },
    { start: "11:30", end: "12:00", title: "World Edition" },
    { start: "12:00", end: "12:30", title: "Lunchtime News" },
    { start: "12:30", end: "13:00", title: "Live Coverage" },
    { start: "13:00", end: "14:00", title: "Afternoon Report" },
    { start: "14:00", end: "15:00", title: "International Desk" },
    { start: "15:00", end: "16:00", title: "Technology Today" },
    { start: "16:00", end: "17:00", title: "Evening Preview" },
    { start: "17:00", end: "18:00", title: "Drive Time" },
    { start: "18:00", end: "19:00", title: "6 O'Clock News" },
    { start: "19:00", end: "20:00", title: "Prime Time News" },
    { start: "20:00", end: "21:00", title: "In Depth" },
    { start: "21:00", end: "22:00", title: "Late Night Edition" },
    { start: "22:00", end: "23:00", title: "Global Roundup" },
    { start: "23:00", end: "24:00", title: "Midnight Digest" },
  ]
  return programs
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    weekday: "long",
  })
}

function toMinutes(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

function getCurrentTimeMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export const EpgPanel: React.FC<EpgPanelProps> = ({ currentChannel }) => {
  const [date, setDate] = useState(new Date())

  const isToday =
    date.toDateString() === new Date().toDateString()

  const programs = generatePrograms(date)
  const nowMinutes = isToday ? getCurrentTimeMinutes() : -1

  const prevDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d)
  }

  const nextDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    setDate(d)
  }

  if (!currentChannel) {
    return (
      <div className="epg-panel">
        <div className="epg-channel-header">
          <div style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
            No channel selected
          </div>
        </div>
        <div className="empty-state">
          <Tv size={36} className="empty-state-icon" />
          <div className="empty-state-title">EPG Guide</div>
          <div className="empty-state-desc">Select a channel to view its programme schedule</div>
        </div>
      </div>
    )
  }

  return (
    <div className="epg-panel">
      {/* Channel header */}
      <div className="epg-channel-header">
        <div className="epg-channel-logo">
          {currentChannel.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentChannel.logo} alt={currentChannel.name} />
          ) : (
            <Tv size={20} style={{ color: "var(--muted-foreground)" }} />
          )}
        </div>
        <div>
          <div className="epg-channel-name">{currentChannel.name}</div>
          {currentChannel.group && (
            <div className="epg-channel-desc">{currentChannel.group}</div>
          )}
        </div>
      </div>

      {/* Date navigation */}
      <div className="epg-date-nav">
        <button className="epg-date-nav-btn" onClick={prevDay}>
          <ChevronLeft size={16} />
        </button>
        <span className="epg-date-label">{formatDate(date)}</span>
        <button className="epg-date-nav-btn" onClick={nextDay}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Program list */}
      <div className="epg-list">
        {programs.map((prog, i) => {
          const startMins = toMinutes(prog.start)
          const endMins = toMinutes(prog.end === "24:00" ? "23:59" : prog.end)
          const isCurrent = isToday && nowMinutes >= startMins && nowMinutes < endMins
          const isPast = isToday && nowMinutes >= endMins

          return (
            <div
              key={i}
              className={`epg-program${isCurrent ? " current" : ""}${isPast ? " past" : ""}`}
            >
              <div className={`epg-program-time${isPast ? " past" : ""}`}>
                {prog.start} – {prog.end}
                {isCurrent && (
                  <span className="epg-live-tag">
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        background: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "blink 1.4s ease-in-out infinite",
                      }}
                    />
                    LIVE
                  </span>
                )}
              </div>
              <div className="epg-program-title">{prog.title}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
