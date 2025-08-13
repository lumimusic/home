import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import TopNav from '../navigation/TopNav'
import PlayerBar from '../player/PlayerBar'
import { usePlayerStore } from '../../stores/playerStore'
import { useLibraryStore } from '../../stores/libraryStore'
import { useThemeStore } from '../../stores/themeStore'
import { musicService } from '../../services/musicService'
import { useAudioEngine } from '../../hooks/useAudioEngine'

const Layout = () => {
  const { currentTrack } = usePlayerStore()
  const { setTracks, setPlaylists, setLoading } = useLibraryStore()
  const { setTheme, currentTheme } = useThemeStore()
  
  // Initialize audio engine
  useAudioEngine()
  
  // Load music data on app start
  useEffect(() => {
    const loadMusicData = async () => {
      setLoading(true)
      
      try {
        const data = await musicService.fetchMusicData()
        
        if (data.tracks) {
          setTracks(data.tracks)
          // Preload critical resources
          await musicService.preloadResources(data.tracks)
        }
        
        if (data.playlists) {
          setPlaylists(data.playlists)
        }
      } catch (error) {
        console.error('Failed to load music data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadMusicData()
  }, [setTracks, setPlaylists, setLoading])
  
  // Apply theme on mount
  useEffect(() => {
    setTheme(currentTheme)
  }, [setTheme, currentTheme])
  
  // Handle visibility change for data revalidation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Revalidate data when app becomes visible
        const lastFetch = localStorage.getItem('aurora-music-last-fetch')
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        
        if (!lastFetch || now - parseInt(lastFetch) > fiveMinutes) {
          musicService.fetchMusicData().then(data => {
            if (data.tracks) setTracks(data.tracks)
            if (data.playlists) setPlaylists(data.playlists)
            localStorage.setItem('aurora-music-last-fetch', now.toString())
          })
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [setTracks, setPlaylists])
  
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Navigation */}
      <TopNav />
      
      {/* Main Content */}
      <main className={currentTrack ? 'pb-20' : 'pb-4'}>
        <Outlet />
      </main>
      
      {/* Player Bar */}
      {currentTrack && <PlayerBar />}
      
      {/* Global Styles for Current Theme */}
      <style jsx global>{`
        :root {
          --primary: ${useThemeStore.getState().themes[currentTheme].primary};
          --bg: ${useThemeStore.getState().themes[currentTheme].bg};
          --surface: ${useThemeStore.getState().themes[currentTheme].surface};
          --muted: ${useThemeStore.getState().themes[currentTheme].muted};
        }
      `}</style>
    </div>
  )
}

export default Layout

