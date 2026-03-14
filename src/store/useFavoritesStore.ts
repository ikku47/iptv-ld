import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Channel } from "@/types/iptv"

// ── Types ────────────────────────────────────────────────────────────────────

export interface FavoritesState {
  /** Persisted list of favourite channels (full objects for offline display) */
  favorites: Channel[]
}

export interface FavoritesActions {
  /** Add or remove a channel from favorites */
  toggleFavorite: (channel: Channel) => void
  /** True when the channel's URL is in the favorites list */
  isFavorite: (channel: Channel) => boolean
  /** Remove all favorites */
  clearFavorites: () => void
}

export type UseFavoritesStore = FavoritesState & FavoritesActions

// ── Store ────────────────────────────────────────────────────────────────────

export const useFavoritesStore = create<UseFavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (channel) => {
        const { favorites } = get()
        const exists = favorites.some((f) => f.url === channel.url)
        set({
          favorites: exists
            ? favorites.filter((f) => f.url !== channel.url)
            : [...favorites, channel],
        })
      },

      isFavorite: (channel) =>
        get().favorites.some((f) => f.url === channel.url),

      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "iptv-favorites-v1",
      storage: createJSONStorage(() => localStorage),
      // Only persist the favorites list, not the action functions
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
)

// ── Selectors ─────────────────────────────────────────────────────────────────
// Use these to avoid re-subscribing to the entire store

/** Returns a stable Set of favorite URLs for O(1) lookup in lists */
export const selectFavoriteUrls = (state: UseFavoritesStore): Set<string> =>
  new Set(state.favorites.map((f) => f.url))
