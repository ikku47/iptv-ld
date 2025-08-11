import React from "react"
import { Search, X } from "lucide-react"

interface ChannelSearchProps {
  searchQuery: string
  isSearching?: boolean
  onSearchChange: (query: string) => void
  onClear?: () => void
}

export const ChannelSearch: React.FC<ChannelSearchProps> = ({
  searchQuery,
  isSearching = false,
  onSearchChange,
  onClear
}) => {
  return (
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
        <input
          type="text"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-lg text-green-400 font-mono text-sm outline-none transition-all duration-300 focus:border-green-500 focus:shadow-lg focus:shadow-green-500/20 placeholder-gray-500"
        />
        {isSearching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-400 p-1 rounded transition-colors duration-200"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
