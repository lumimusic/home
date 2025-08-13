import { useEffect, useRef, useCallback } from 'react'
import { usePlayerStore } from '../stores/playerStore'
import { useLibraryStore } from '../stores/libraryStore'

export const useAudioEngine = () => {
  const audioRef = useRef(null)
  const analyserRef = useRef(null)
  const audioContextRef = useRef(null)
  const sourceRef = useRef(null)
  const iframeRef = useRef(null)
  
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    repeat,
    playbackRate,
    queue,
    queueIndex,
    setPlaybackState,
    setCurrentTrack,
    playNext,
    playPrevious,
    addToHistory,
    setAudioElement,
    setAnalyserNode,
    setAudioContext,
  } = usePlayerStore()
  
  const { incrementPlayCount } = useLibraryStore()
  
  // Initialize audio context and analyser
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      
      setAudioContext(audioContextRef.current)
      setAnalyserNode(analyserRef.current)
    }
  }, [setAudioContext, setAnalyserNode])
  
  // Create audio element
  const createAudioElement = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.crossOrigin = 'anonymous'
      audioRef.current.preload = 'metadata'
      
      // Connect to analyser
      initializeAudioContext()
      if (audioContextRef.current && analyserRef.current && !sourceRef.current) {
        try {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
          sourceRef.current.connect(analyserRef.current)
          analyserRef.current.connect(audioContextRef.current.destination)
        } catch (error) {
          console.warn('Could not connect audio to analyser:', error)
        }
      }
      
      setAudioElement(audioRef.current)
      
      // Event listeners
      audioRef.current.addEventListener('loadstart', () => {
        setPlaybackState({ isLoading: true })
      })
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setPlaybackState({ 
          duration: audioRef.current.duration,
          isLoading: false 
        })
      })
      
      audioRef.current.addEventListener('timeupdate', () => {
        setPlaybackState({ currentTime: audioRef.current.currentTime })
      })
      
      audioRef.current.addEventListener('play', () => {
        setPlaybackState({ isPlaying: true, isPaused: false })
      })
      
      audioRef.current.addEventListener('pause', () => {
        setPlaybackState({ isPlaying: false, isPaused: true })
      })
      
      audioRef.current.addEventListener('ended', () => {
        handleTrackEnd()
      })
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e)
        setPlaybackState({ isLoading: false, isPlaying: false })
        // Try next track or fallback
        handleAudioError()
      })
      
      // Apply initial settings
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.playbackRate = playbackRate
    }
    
    return audioRef.current
  }, [volume, isMuted, playbackRate, setAudioElement, setPlaybackState, initializeAudioContext])
  
  // Handle track end
  const handleTrackEnd = useCallback(() => {
    if (repeat === 'one') {
      audioRef.current?.play()
      return
    }
    
    const hasNext = playNext()
    if (!hasNext && repeat !== 'all') {
      setPlaybackState({ isPlaying: false, isPaused: true })
    }
  }, [repeat, playNext, setPlaybackState])
  
  // Handle audio errors
  const handleAudioError = useCallback(() => {
    if (currentTrack?.embedUrl) {
      // Switch to iframe mode
      setPlaybackState({ useIframe: true })
    } else {
      // Try next track
      playNext()
    }
  }, [currentTrack, playNext, setPlaybackState])
  
  // Load track
  const loadTrack = useCallback((track) => {
    if (!track) return
    
    setCurrentTrack(track)
    setPlaybackState({ isLoading: true, useIframe: false })
    
    // Try direct audio sources first
    if (track.sources?.length > 0) {
      const audioSource = track.sources.find(s => s.type === 'audio')
      if (audioSource) {
        const audio = createAudioElement()
        audio.src = audioSource.url
        audio.load()
        return
      }
    }
    
    // Fallback to embed
    if (track.embedUrl) {
      setPlaybackState({ useIframe: true, isLoading: false })
      return
    }
    
    // No playable source
    console.warn('No playable source for track:', track)
    setPlaybackState({ isLoading: false })
  }, [createAudioElement, setCurrentTrack, setPlaybackState])
  
  // Play/Pause
  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    
    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume()
      }
      
      if (isPlaying) {
        audio.pause()
      } else {
        await audio.play()
        // Track play count
        incrementPlayCount(currentTrack.id)
        addToHistory(currentTrack)
      }
    } catch (error) {
      console.error('Playback error:', error)
      handleAudioError()
    }
  }, [isPlaying, currentTrack, incrementPlayCount, addToHistory, handleAudioError])
  
  // Seek
  const seek = useCallback((time) => {
    const audio = audioRef.current
    if (audio && !isNaN(audio.duration)) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration))
    }
  }, [])
  
  // Set volume
  const setVolume = useCallback((newVolume) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = newVolume
    }
  }, [])
  
  // Set playback rate
  const setPlaybackRate = useCallback((rate) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = rate
    }
  }, [])
  
  // Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: currentTrack.cover ? [
          { src: currentTrack.cover, sizes: '512x512', type: 'image/jpeg' }
        ] : []
      })
      
      navigator.mediaSession.setActionHandler('play', togglePlayPause)
      navigator.mediaSession.setActionHandler('pause', togglePlayPause)
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious)
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext())
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) {
          seek(details.seekTime)
        }
      })
    }
  }, [currentTrack, togglePlayPause, playPrevious, playNext, seek])
  
  // Load current track from queue
  useEffect(() => {
    if (queue.length > 0 && queueIndex >= 0 && queueIndex < queue.length) {
      const track = queue[queueIndex]
      if (!currentTrack || currentTrack.id !== track.id) {
        loadTrack(track)
      }
    }
  }, [queue, queueIndex, currentTrack, loadTrack])
  
  // Update audio properties when store changes
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = isMuted ? 0 : volume
      audio.playbackRate = playbackRate
    }
  }, [volume, isMuted, playbackRate])
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])
  
  return {
    // Audio element refs
    audioElement: audioRef.current,
    analyserNode: analyserRef.current,
    audioContext: audioContextRef.current,
    
    // Control methods
    togglePlayPause,
    seek,
    setVolume,
    setPlaybackRate,
    loadTrack,
    
    // State
    isReady: !!audioRef.current,
  }
}

