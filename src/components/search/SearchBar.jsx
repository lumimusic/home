import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../../stores/libraryStore'
import { usePlayerStore } from '../../stores/playerStore'
import { clsx } from 'clsx'

// Icons
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
)

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
  </svg>
)

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    tag: '',
    artist: '',
    year: '',
    explicit: undefined
  })
  
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const debounceRef = useRef(null)
  
  const navigate = useNavigate()
  const { searchTracks, tracks, artists } = useLibraryStore()
  const { setQueue, setCurrentTrack } = usePlayerStore()
  
  // Debounced search
  const debouncedSearch = useCallback((searchQuery, searchFilters) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        const searchResults = searchTracks(searchQuery, searchFilters)
        setResults(searchResults.slice(0, 10)) // Limit to 10 results
        setShowResults(true)
        setSelectedIndex(-1)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)
  }, [searchTracks])
  
  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value, filters)
  }
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (query.trim()) {
      debouncedSearch(query, newFilters)
    }
  }
  
  // Clear filters
  const clearFilters = () => {
    setFilters({
      tag: '',
      artist: '',
      year: '',
      explicit: undefined
    })
    if (query.trim()) {
      debouncedSearch(query, {})
    }
  }
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
        
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
        
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleTrackSelect(results[selectedIndex])
        } else if (results.length > 0) {
          handleTrackSelect(results[0])
        }
        break
        
      case 'Escape':
        setShowResults(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }
  
  // Handle track selection
  const handleTrackSelect = (track) => {
    setQueue([track], 0)
    setCurrentTrack(track)
    setShowResults(false)
    setQuery('')
    onClose?.()
  }
  
  // Handle play all results
  const handlePlayAll = () => {
    if (results.length > 0) {
      setQueue(results, 0)
      setCurrentTrack(results[0])
      setShowResults(false)
      setQuery('')
      onClose?.()
    }
  }
  
  // Focus input on '/' key
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }
    
    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResults])
  
  // Get unique tags and years for filters
  const availableTags = [...new Set(tracks.flatMap(track => track.tags || []))]
  const availableYears = [...new Set(tracks.map(track => track.year).filter(Boolean))].sort((a, b) => b - a)
  
  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== undefined)
  
  return (
    <div className="relative" ref={resultsRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <SearchIcon />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Tìm kiếm bài hát, nghệ sĩ, album... (nhấn '/' để focus)"
          className="w-full pl-10 pr-20 py-2 bg-background-surface border border-white/20 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              hasActiveFilters 
                ? "text-primary bg-primary/20" 
                : "text-text-muted hover:text-white hover:bg-white/10"
            )}
            title="Bộ lọc"
          >
            <FilterIcon />
          </button>
          
          {/* Clear Button */}
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setResults([])
                setShowResults(false)
                inputRef.current?.focus()
              }}
              className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 glass rounded-xl shadow-aurora-soft z-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Thể loại</label>
              <select
                value={filters.tag}
                onChange={(e) => handleFilterChange('tag', e.target.value)}
                className="w-full px-2 py-1 bg-background-surface border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Tất cả</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-text-muted mb-1">Nghệ sĩ</label>
              <select
                value={filters.artist}
                onChange={(e) => handleFilterChange('artist', e.target.value)}
                className="w-full px-2 py-1 bg-background-surface border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Tất cả</option>
                {artists.map(artist => (
                  <option key={artist.name} value={artist.name}>{artist.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-text-muted mb-1">Năm</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-2 py-1 bg-background-surface border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Tất cả</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-xs text-text-muted hover:text-white border border-white/20 rounded-lg hover:border-primary transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-aurora-soft overflow-hidden z-40">
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {results.length} kết quả
            </span>
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-3 py-1 text-xs text-primary hover:bg-primary/20 rounded-lg transition-colors"
            >
              <PlayIcon />
              Phát tất cả
            </button>
          </div>
          
          {/* Results List */}
          <div className="max-h-80 overflow-y-auto">
            {results.map((track, index) => (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className={clsx(
                  "w-full p-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left",
                  selectedIndex === index && "bg-white/10"
                )}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-background-surface flex-shrink-0">
                  {track.cover ? (
                    <img 
                      src={track.cover} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-white truncate text-sm">
                    {track.title}
                  </h4>
                  <p className="text-text-muted text-xs truncate">
                    {track.artist} • {track.album}
                  </p>
                </div>
                
                {track.explicit && (
                  <span className="text-xs text-text-muted bg-white/20 px-1.5 py-0.5 rounded">
                    E
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* No Results */}
      {showResults && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-6 glass rounded-xl shadow-aurora-soft text-center">
          <p className="text-text-muted">
            Không tìm thấy kết quả cho "{query}"
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchBar

