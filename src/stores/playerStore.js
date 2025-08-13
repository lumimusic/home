import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      // Current playback state
      currentTrack: null,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      
      // Player settings
      repeat: 'none', // 'none', 'one', 'all'
      shuffle: false,
      playbackRate: 1.0,
      crossfade: 0,
      
      // Queue management
      queue: [],
      queueIndex: -1,
      originalQueue: [], // For shuffle mode
      history: [],
      
      // UI state
      showLyrics: false,
      showQueue: false,
      showVisualizer: true,
      miniPlayerMode: false,
      
      // Audio engine state
      audioElement: null,
      analyserNode: null,
      audioContext: null,
      
      // Actions
      setCurrentTrack: (track) => set({ currentTrack: track }),
      
      setPlaybackState: (state) => set(state),
      
      setVolume: (volume) => {
        const { audioElement } = get()
        if (audioElement) {
          audioElement.volume = volume
        }
        set({ volume, isMuted: volume === 0 })
      },
      
      toggleMute: () => {
        const { isMuted, volume, audioElement } = get()
        if (audioElement) {
          audioElement.volume = isMuted ? volume : 0
        }
        set({ isMuted: !isMuted })
      },
      
      setRepeat: (mode) => set({ repeat: mode }),
      
      toggleShuffle: () => {
        const { shuffle, queue, queueIndex } = get()
        const newShuffle = !shuffle
        
        if (newShuffle) {
          // Enable shuffle: save original queue and shuffle
          const originalQueue = [...queue]
          const currentTrack = queue[queueIndex]
          const shuffledQueue = [...queue].sort(() => Math.random() - 0.5)
          
          // Ensure current track stays at current position
          if (currentTrack) {
            const currentIndex = shuffledQueue.findIndex(t => t.id === currentTrack.id)
            if (currentIndex !== -1) {
              [shuffledQueue[queueIndex], shuffledQueue[currentIndex]] = 
              [shuffledQueue[currentIndex], shuffledQueue[queueIndex]]
            }
          }
          
          set({ 
            shuffle: true, 
            queue: shuffledQueue, 
            originalQueue 
          })
        } else {
          // Disable shuffle: restore original queue
          const { originalQueue, currentTrack } = get()
          const newIndex = originalQueue.findIndex(t => t?.id === currentTrack?.id)
          
          set({ 
            shuffle: false, 
            queue: originalQueue, 
            queueIndex: newIndex >= 0 ? newIndex : 0,
            originalQueue: [] 
          })
        }
      },
      
      setQueue: (tracks, startIndex = 0) => {
        set({ 
          queue: tracks, 
          queueIndex: startIndex,
          originalQueue: get().shuffle ? tracks : []
        })
      },
      
      addToQueue: (track) => {
        const { queue } = get()
        set({ queue: [...queue, track] })
      },
      
      removeFromQueue: (index) => {
        const { queue, queueIndex } = get()
        const newQueue = queue.filter((_, i) => i !== index)
        const newIndex = index < queueIndex ? queueIndex - 1 : queueIndex
        
        set({ 
          queue: newQueue, 
          queueIndex: Math.max(0, Math.min(newIndex, newQueue.length - 1))
        })
      },
      
      reorderQueue: (fromIndex, toIndex) => {
        const { queue, queueIndex } = get()
        const newQueue = [...queue]
        const [removed] = newQueue.splice(fromIndex, 1)
        newQueue.splice(toIndex, 0, removed)
        
        // Update queue index if current track moved
        let newQueueIndex = queueIndex
        if (fromIndex === queueIndex) {
          newQueueIndex = toIndex
        } else if (fromIndex < queueIndex && toIndex >= queueIndex) {
          newQueueIndex = queueIndex - 1
        } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
          newQueueIndex = queueIndex + 1
        }
        
        set({ queue: newQueue, queueIndex: newQueueIndex })
      },
      
      playNext: () => {
        const { queue, queueIndex, repeat } = get()
        let nextIndex = queueIndex + 1
        
        if (nextIndex >= queue.length) {
          if (repeat === 'all') {
            nextIndex = 0
          } else {
            return false // End of queue
          }
        }
        
        set({ queueIndex: nextIndex })
        return true
      },
      
      playPrevious: () => {
        const { queue, queueIndex } = get()
        let prevIndex = queueIndex - 1
        
        if (prevIndex < 0) {
          prevIndex = queue.length - 1
        }
        
        set({ queueIndex: prevIndex })
        return true
      },
      
      addToHistory: (track) => {
        const { history } = get()
        const newHistory = [track, ...history.filter(t => t.id !== track.id)].slice(0, 50)
        set({ history: newHistory })
      },
      
      // UI toggles
      toggleLyrics: () => set(state => ({ showLyrics: !state.showLyrics })),
      toggleQueue: () => set(state => ({ showQueue: !state.showQueue })),
      toggleVisualizer: () => set(state => ({ showVisualizer: !state.showVisualizer })),
      setMiniPlayerMode: (mode) => set({ miniPlayerMode: mode }),
      
      // Audio engine
      setAudioElement: (element) => set({ audioElement: element }),
      setAnalyserNode: (node) => set({ analyserNode: node }),
      setAudioContext: (context) => set({ audioContext: context }),
    }),
    {
      name: 'aurora-player',
      partialize: (state) => ({
        volume: state.volume,
        repeat: state.repeat,
        shuffle: state.shuffle,
        playbackRate: state.playbackRate,
        showLyrics: state.showLyrics,
        showQueue: state.showQueue,
        showVisualizer: state.showVisualizer,
        history: state.history,
      }),
    }
  )
)

