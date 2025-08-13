import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLibraryStore = create(
  persist(
    (set, get) => ({
      // Library data
      tracks: [],
      playlists: [],
      artists: [],
      albums: [],
      
      // User data
      likedTracks: new Set(),
      playCount: {},
      
      // Loading states
      isLoading: false,
      lastFetch: null,
      
      // Actions
      setTracks: (tracks) => {
        // Process tracks to extract artists and albums
        const artistsMap = new Map()
        const albumsMap = new Map()
        
        tracks.forEach(track => {
          // Process artists
          if (track.artist && !artistsMap.has(track.artist)) {
            artistsMap.set(track.artist, {
              name: track.artist,
              tracks: [],
              albums: new Set(),
            })
          }
          
          // Process albums
          if (track.album && !albumsMap.has(track.album)) {
            albumsMap.set(track.album, {
              name: track.album,
              artist: track.artist,
              year: track.year,
              cover: track.cover,
              tracks: [],
            })
          }
          
          // Add track to artist and album
          if (artistsMap.has(track.artist)) {
            artistsMap.get(track.artist).tracks.push(track)
            if (track.album) {
              artistsMap.get(track.artist).albums.add(track.album)
            }
          }
          
          if (albumsMap.has(track.album)) {
            albumsMap.get(track.album).tracks.push(track)
          }
        })
        
        // Convert maps to arrays
        const artists = Array.from(artistsMap.values()).map(artist => ({
          ...artist,
          albums: Array.from(artist.albums),
        }))
        
        const albums = Array.from(albumsMap.values())
        
        set({ 
          tracks, 
          artists, 
          albums,
          lastFetch: Date.now()
        })
      },
      
      setPlaylists: (playlists) => set({ playlists }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Liked tracks management
      toggleLikeTrack: (trackId) => {
        const { likedTracks } = get()
        const newLikedTracks = new Set(likedTracks)
        
        if (newLikedTracks.has(trackId)) {
          newLikedTracks.delete(trackId)
        } else {
          newLikedTracks.add(trackId)
        }
        
        set({ likedTracks: newLikedTracks })
      },
      
      isTrackLiked: (trackId) => {
        const { likedTracks } = get()
        return likedTracks.has(trackId)
      },
      
      getLikedTracks: () => {
        const { tracks, likedTracks } = get()
        return tracks.filter(track => likedTracks.has(track.id))
      },
      
      // Play count management
      incrementPlayCount: (trackId) => {
        const { playCount } = get()
        set({ 
          playCount: { 
            ...playCount, 
            [trackId]: (playCount[trackId] || 0) + 1 
          }
        })
      },
      
      getPlayCount: (trackId) => {
        const { playCount } = get()
        return playCount[trackId] || 0
      },
      
      // Generated playlists
      getTrendingTracks: (limit = 10) => {
        const { tracks, playCount } = get()
        return tracks
          .map(track => ({
            ...track,
            plays: playCount[track.id] || 0
          }))
          .sort((a, b) => b.plays - a.plays)
          .slice(0, limit)
      },
      
      getNewReleases: (limit = 10) => {
        const { tracks } = get()
        return tracks
          .filter(track => track.year)
          .sort((a, b) => (b.year || 0) - (a.year || 0))
          .slice(0, limit)
      },
      
      getRecentlyPlayed: (limit = 10) => {
        // This would be managed by playerStore history
        return []
      },
      
      // Search functionality
      searchTracks: (query, filters = {}) => {
        const { tracks } = get()
        if (!query.trim()) return tracks
        
        const searchTerm = query.toLowerCase()
        
        return tracks.filter(track => {
          // Text search
          const matchesText = 
            track.title?.toLowerCase().includes(searchTerm) ||
            track.artist?.toLowerCase().includes(searchTerm) ||
            track.album?.toLowerCase().includes(searchTerm) ||
            track.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
          
          if (!matchesText) return false
          
          // Apply filters
          if (filters.tag && !track.tags?.includes(filters.tag)) return false
          if (filters.artist && track.artist !== filters.artist) return false
          if (filters.year && track.year !== filters.year) return false
          if (filters.explicit !== undefined && track.explicit !== filters.explicit) return false
          
          return true
        })
      },
      
      // Playlist management
      createPlaylist: (name, trackIds = []) => {
        const { playlists } = get()
        const newPlaylist = {
          id: `pl-${Date.now()}`,
          name,
          trackIds,
          cover: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        
        set({ playlists: [...playlists, newPlaylist] })
        return newPlaylist
      },
      
      updatePlaylist: (playlistId, updates) => {
        const { playlists } = get()
        const updatedPlaylists = playlists.map(playlist =>
          playlist.id === playlistId
            ? { ...playlist, ...updates, updatedAt: Date.now() }
            : playlist
        )
        
        set({ playlists: updatedPlaylists })
      },
      
      deletePlaylist: (playlistId) => {
        const { playlists } = get()
        set({ playlists: playlists.filter(p => p.id !== playlistId) })
      },
      
      addTrackToPlaylist: (playlistId, trackId) => {
        const { playlists } = get()
        const playlist = playlists.find(p => p.id === playlistId)
        if (!playlist || playlist.trackIds.includes(trackId)) return
        
        get().updatePlaylist(playlistId, {
          trackIds: [...playlist.trackIds, trackId]
        })
      },
      
      removeTrackFromPlaylist: (playlistId, trackId) => {
        const { playlists } = get()
        const playlist = playlists.find(p => p.id === playlistId)
        if (!playlist) return
        
        get().updatePlaylist(playlistId, {
          trackIds: playlist.trackIds.filter(id => id !== trackId)
        })
      },
      
      getPlaylistTracks: (playlistId) => {
        const { playlists, tracks } = get()
        const playlist = playlists.find(p => p.id === playlistId)
        if (!playlist) return []
        
        return playlist.trackIds
          .map(id => tracks.find(track => track.id === id))
          .filter(Boolean)
      },
    }),
    {
      name: 'aurora-library',
      partialize: (state) => ({
        likedTracks: Array.from(state.likedTracks), // Convert Set to Array for persistence
        playCount: state.playCount,
        playlists: state.playlists,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.likedTracks)) {
          // Convert Array back to Set
          state.likedTracks = new Set(state.likedTracks)
        }
      },
    }
  )
)

