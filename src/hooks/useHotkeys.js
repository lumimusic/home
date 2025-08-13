import { useEffect } from 'react'
import { usePlayerStore } from '../stores/playerStore'
import { useAudioEngine } from './useAudioEngine'

export const useHotkeys = () => {
  const {
    isPlaying,
    volume,
    showLyrics,
    showQueue,
    repeat,
    shuffle,
    setVolume,
    toggleLyrics,
    toggleQueue,
    setRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
  } = usePlayerStore()
  
  const { togglePlayPause, seek } = useAudioEngine()
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger hotkeys when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return
      }
      
      // Don't trigger if modifier keys are pressed (except for some specific combinations)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlayPause()
          break
          
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) {
            // Shift + Left: Previous track
            playPrevious()
          } else {
            // Left: Seek backward 5s
            const audio = document.querySelector('audio')
            if (audio) {
              seek(Math.max(0, audio.currentTime - 5))
            }
          }
          break
          
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) {
            // Shift + Right: Next track
            playNext()
          } else {
            // Right: Seek forward 5s
            const audio = document.querySelector('audio')
            if (audio) {
              seek(audio.currentTime + 5)
            }
          }
          break
          
        case 'ArrowUp':
          e.preventDefault()
          // Volume up
          setVolume(Math.min(1, volume + 0.1))
          break
          
        case 'ArrowDown':
          e.preventDefault()
          // Volume down
          setVolume(Math.max(0, volume - 0.1))
          break
          
        case 'KeyL':
          e.preventDefault()
          toggleLyrics()
          break
          
        case 'KeyQ':
          e.preventDefault()
          toggleQueue()
          break
          
        case 'KeyR':
          e.preventDefault()
          // Cycle through repeat modes
          const repeatModes = ['none', 'all', 'one']
          const currentIndex = repeatModes.indexOf(repeat)
          const nextMode = repeatModes[(currentIndex + 1) % repeatModes.length]
          setRepeat(nextMode)
          break
          
        case 'KeyS':
          e.preventDefault()
          toggleShuffle()
          break
          
        case 'KeyM':
          e.preventDefault()
          // Mute/unmute
          const { toggleMute } = usePlayerStore.getState()
          toggleMute()
          break
          
        case 'Digit0':
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          e.preventDefault()
          // Seek to percentage (0-9 = 0%-90%)
          const percentage = parseInt(e.code.slice(-1)) / 10
          const audio = document.querySelector('audio')
          if (audio && audio.duration) {
            seek(audio.duration * percentage)
          }
          break
          
        case 'Home':
          e.preventDefault()
          // Seek to beginning
          seek(0)
          break
          
        case 'End':
          e.preventDefault()
          // Seek to end (minus 5 seconds to avoid triggering next track)
          const audioEl = document.querySelector('audio')
          if (audioEl && audioEl.duration) {
            seek(Math.max(0, audioEl.duration - 5))
          }
          break
          
        case 'Equal':
        case 'NumpadAdd':
          if (e.shiftKey) {
            e.preventDefault()
            // Increase playback rate
            const { playbackRate, setPlaybackRate } = usePlayerStore.getState()
            const newRate = Math.min(2, playbackRate + 0.25)
            setPlaybackRate(newRate)
          }
          break
          
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault()
          // Decrease playback rate
          const { playbackRate, setPlaybackRate } = usePlayerStore.getState()
          const newRate = Math.max(0.5, playbackRate - 0.25)
          setPlaybackRate(newRate)
          break
          
        case 'Backspace':
          e.preventDefault()
          // Reset playback rate to 1x
          const { setPlaybackRate } = usePlayerStore.getState()
          setPlaybackRate(1.0)
          break
      }
    }
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown)
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    isPlaying,
    volume,
    showLyrics,
    showQueue,
    repeat,
    shuffle,
    togglePlayPause,
    seek,
    setVolume,
    toggleLyrics,
    toggleQueue,
    setRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
  ])
  
  // Show hotkey hints (could be used in a help modal)
  const getHotkeyHints = () => [
    { key: 'Space', description: 'Play/Pause' },
    { key: '←/→', description: 'Seek ±5s' },
    { key: 'Shift + ←/→', description: 'Previous/Next track' },
    { key: '↑/↓', description: 'Volume ±10%' },
    { key: 'L', description: 'Toggle lyrics' },
    { key: 'Q', description: 'Toggle queue' },
    { key: 'R', description: 'Cycle repeat mode' },
    { key: 'S', description: 'Toggle shuffle' },
    { key: 'M', description: 'Mute/unmute' },
    { key: '0-9', description: 'Seek to 0%-90%' },
    { key: 'Home/End', description: 'Seek to start/end' },
    { key: '+/-', description: 'Playback rate ±0.25x' },
    { key: 'Backspace', description: 'Reset playback rate' },
  ]
  
  return { getHotkeyHints }
}

