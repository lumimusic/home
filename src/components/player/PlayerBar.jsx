import { useState, useEffect, useRef } from 'react'
import { usePlayerStore } from '../../stores/playerStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import Button from '../ui/Button'
import { clsx } from 'clsx'

// Icons (using simple SVG paths)
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
)

const PrevIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
  </svg>
)

const NextIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>
)

const ShuffleIcon = ({ active }) => (
  <svg className={clsx("w-4 h-4", active && "text-primary")} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
  </svg>
)

const RepeatIcon = ({ mode }) => (
  <svg className={clsx("w-4 h-4", mode !== 'none' && "text-primary")} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
    {mode === 'one' && (
      <text x="12" y="15" textAnchor="middle" fontSize="8" fill="currentColor">1</text>
    )}
  </svg>
)

const VolumeIcon = ({ volume, muted }) => {
  if (muted || volume === 0) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>
    )
  } else if (volume < 0.5) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
      </svg>
    )
  } else {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    )
  }
}

const QueueIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
  </svg>
)

const LyricsIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
)

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const PlayerBar = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const seekBarRef = useRef(null)
  const volumeSliderRef = useRef(null)
  
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeat,
    shuffle,
    showQueue,
    showLyrics,
    miniPlayerMode,
    playPrevious,
    playNext,
    toggleShuffle,
    setRepeat,
    setVolume,
    toggleMute,
    toggleQueue,
    toggleLyrics,
  } = usePlayerStore()
  
  const { togglePlayPause, seek } = useAudioEngine()
  
  // Handle seek bar interaction
  const handleSeekMouseDown = (e) => {
    if (!seekBarRef.current || !duration) return
    setIsDragging(true)
    updateSeekPosition(e)
  }
  
  const handleSeekMouseMove = (e) => {
    if (!isDragging) return
    updateSeekPosition(e)
  }
  
  const handleSeekMouseUp = () => {
    if (isDragging) {
      seek(dragTime)
      setIsDragging(false)
    }
  }
  
  const updateSeekPosition = (e) => {
    if (!seekBarRef.current || !duration) return
    
    const rect = seekBarRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const time = percent * duration
    setDragTime(time)
  }
  
  // Handle volume slider
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }
  
  // Handle repeat mode cycling
  const handleRepeatClick = () => {
    const modes = ['none', 'all', 'one']
    const currentIndex = modes.indexOf(repeat)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setRepeat(nextMode)
  }
  
  // Global mouse events for seeking
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleSeekMouseMove)
      document.addEventListener('mouseup', handleSeekMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleSeekMouseMove)
        document.removeEventListener('mouseup', handleSeekMouseUp)
      }
    }
  }, [isDragging])
  
  // Hide volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (volumeSliderRef.current && !volumeSliderRef.current.contains(e.target)) {
        setShowVolumeSlider(false)
      }
    }
    
    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVolumeSlider])
  
  if (!currentTrack) {
    return null
  }
  
  const progress = isDragging ? (dragTime / duration) * 100 : (currentTime / duration) * 100
  
  return (
    <div className={clsx(
      "fixed bottom-0 left-0 right-0 z-50 player-bar",
      miniPlayerMode ? "h-16" : "h-20"
    )}>
      <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-background-surface flex-shrink-0">
            {currentTrack.cover ? (
              <img 
                src={currentTrack.cover} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50" />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-white truncate text-sm">
              {currentTrack.title}
            </h4>
            <p className="text-text-muted text-xs truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>
        
        {/* Main Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              className="text-text-muted hover:text-white"
            >
              <ShuffleIcon active={shuffle} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              className="text-text-muted hover:text-white"
            >
              <PrevIcon />
            </Button>
            
            <Button
              variant="primary"
              size="icon"
              onClick={togglePlayPause}
              className="w-10 h-10"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => playNext()}
              className="text-text-muted hover:text-white"
            >
              <NextIcon />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRepeatClick}
              className="text-text-muted hover:text-white"
            >
              <RepeatIcon mode={repeat} />
            </Button>
          </div>
          
          {/* Seek Bar */}
          {!miniPlayerMode && (
            <div className="flex items-center gap-2 w-full text-xs text-text-muted">
              <span className="w-10 text-right">
                {formatTime(isDragging ? dragTime : currentTime)}
              </span>
              
              <div 
                ref={seekBarRef}
                className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative group"
                onMouseDown={handleSeekMouseDown}
              >
                <div 
                  className="h-full bg-primary rounded-full relative"
                  style={{ width: `${progress || 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <span className="w-10">
                {formatTime(duration)}
              </span>
            </div>
          )}
        </div>
        
        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLyrics}
            className={clsx(
              "text-text-muted hover:text-white",
              showLyrics && "text-primary"
            )}
          >
            <LyricsIcon />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleQueue}
            className={clsx(
              "text-text-muted hover:text-white",
              showQueue && "text-primary"
            )}
          >
            <QueueIcon />
          </Button>
          
          {/* Volume Control */}
          <div className="relative" ref={volumeSliderRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              onDoubleClick={toggleMute}
              className="text-text-muted hover:text-white"
            >
              <VolumeIcon volume={volume} muted={isMuted} />
            </Button>
            
            {showVolumeSlider && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-background-surface rounded-lg shadow-aurora-soft">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerBar

