import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePlayerStore } from '../../stores/playerStore'
import { useThemeStore } from '../../stores/themeStore'
import Button from '../ui/Button'
import SearchBar from '../search/SearchBar'
import { clsx } from 'clsx'

// Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
)

const ForwardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
)

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
)

const ThemeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 18c-.89 0-1.74-.19-2.5-.54C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.46C10.26 6.19 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>
  </svg>
)

const TopNav = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const { currentTrack, miniPlayerMode, setMiniPlayerMode } = usePlayerStore()
  const { toggleTheme, getCurrentTheme } = useThemeStore()
  
  // Handle scroll for blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Auto mini-player mode when scrolling
      if (currentTrack) {
        setMiniPlayerMode(window.scrollY > 100)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentTrack, setMiniPlayerMode])
  
  // Navigation handlers
  const canGoBack = window.history.length > 1
  const canGoForward = false // Browser doesn't expose forward history
  
  const handleBack = () => {
    if (canGoBack) {
      navigate(-1)
    }
  }
  
  const handleForward = () => {
    navigate(1)
  }
  
  // Get page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Trang chủ'
      case '/library':
        return 'Thư viện'
      case '/player':
        return 'Đang phát'
      case '/settings':
        return 'Cài đặt'
      default:
        if (location.pathname.startsWith('/playlist/')) {
          return 'Playlist'
        }
        return 'Aurora Luxe'
    }
  }
  
  const currentTheme = getCurrentTheme()
  
  return (
    <>
      <nav className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled ? "glass backdrop-blur-aurora" : "bg-transparent"
      )}>
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Section - Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={!canGoBack}
              className="text-text-muted hover:text-white disabled:opacity-30"
            >
              <BackIcon />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleForward}
              disabled={!canGoForward}
              className="text-text-muted hover:text-white disabled:opacity-30"
            >
              <ForwardIcon />
            </Button>
            
            {/* Page Title */}
            <h1 className="font-display text-xl font-semibold text-white ml-4 hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>
          
          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <SearchBar />
          </div>
          
          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="text-text-muted hover:text-white md:hidden"
            >
              <SearchIcon />
            </Button>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-text-muted hover:text-white"
              title={`Switch to ${currentTheme.id === 'luxe-dark' ? 'Light' : 'Dark'} theme`}
            >
              <ThemeIcon />
            </Button>
            
            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-muted hover:text-white"
            >
              <MenuIcon />
            </Button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="border-t border-white/10 p-4 md:hidden">
            <SearchBar onClose={() => setShowSearch(false)} />
          </div>
        )}
        
        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-full right-4 mt-2 w-48 glass rounded-aurora shadow-aurora-soft overflow-hidden">
            <div className="py-2">
              <button
                onClick={() => {
                  navigate('/')
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
              >
                🏠 Trang chủ
              </button>
              
              <button
                onClick={() => {
                  navigate('/library')
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
              >
                📚 Thư viện
              </button>
              
              {currentTrack && (
                <button
                  onClick={() => {
                    navigate('/player')
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                >
                  🎵 Đang phát
                </button>
              )}
              
              <hr className="my-2 border-white/10" />
              
              <button
                onClick={() => {
                  navigate('/settings')
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
              >
                ⚙️ Cài đặt
              </button>
              
              <button
                onClick={() => {
                  toggleTheme()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
              >
                🎨 {currentTheme.name}
              </button>
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="h-16" />
      
      {/* Click outside to close menu */}
      {(showMenu || showSearch) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowMenu(false)
            setShowSearch(false)
          }}
        />
      )}
    </>
  )
}

export default TopNav

