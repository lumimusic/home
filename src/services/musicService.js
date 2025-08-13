class MusicService {
  constructor() {
    this.baseUrl = window.location.origin
    this.cache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
  }
  
  async fetchMusicData() {
    const cacheKey = 'music-data'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/music.json`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Cache the data
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
      
      return data
    } catch (error) {
      console.error('Failed to fetch music data:', error)
      
      // Return cached data if available, even if expired
      if (cached) {
        console.warn('Using expired cache due to fetch error')
        return cached.data
      }
      
      // Return fallback data
      return this.getFallbackData()
    }
  }
  
  async fetchLyrics(lyricsPath) {
    if (!lyricsPath) return null
    
    const cacheKey = `lyrics-${lyricsPath}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/${lyricsPath}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      
      // Parse LRC format if applicable
      const lyrics = this.parseLyrics(text, lyricsPath)
      
      // Cache the lyrics
      this.cache.set(cacheKey, {
        data: lyrics,
        timestamp: Date.now()
      })
      
      return lyrics
    } catch (error) {
      console.error('Failed to fetch lyrics:', error)
      return null
    }
  }
  
  parseLyrics(text, filePath) {
    const isLRC = filePath.endsWith('.lrc')
    
    if (isLRC) {
      return this.parseLRCFormat(text)
    } else {
      return this.parsePlainText(text)
    }
  }
  
  parseLRCFormat(lrcText) {
    const lines = lrcText.split('\n')
    const lyrics = []
    const metadata = {}
    
    const timeRegex = /\\[(\\d{2}):(\\d{2})\\.(\\d{2})\\]/
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return
      
      // Parse metadata
      if (trimmedLine.startsWith('[') && !timeRegex.test(trimmedLine)) {
        const metaMatch = trimmedLine.match(/\\[([^:]+):(.*)\\]/)
        if (metaMatch) {
          metadata[metaMatch[1]] = metaMatch[2]
        }
        return
      }
      
      // Parse timed lyrics
      const timeMatch = trimmedLine.match(/\\[(\\d{2}):(\\d{2})\\.(\\d{2})\\](.*)/)
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1])
        const seconds = parseInt(timeMatch[2])
        const centiseconds = parseInt(timeMatch[3])
        const text = timeMatch[4].trim()
        
        const time = minutes * 60 + seconds + centiseconds / 100
        
        lyrics.push({
          time,
          text,
          active: false
        })
      }
    })
    
    // Sort by time
    lyrics.sort((a, b) => a.time - b.time)
    
    return {
      type: 'lrc',
      metadata,
      lines: lyrics
    }
  }
  
  parsePlainText(text) {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(text => ({ text, active: false }))
    
    return {
      type: 'plain',
      lines
    }
  }
  
  getFallbackData() {
    return {
      tracks: [
        {
          id: 'fallback-1',
          title: 'Aurora Luxe Demo',
          artist: 'Demo Artist',
          album: 'Demo Album',
          year: 2024,
          cover: 'https://via.placeholder.com/300x300/C7A26A/0B0B0D?text=Aurora+Luxe',
          duration: 0,
          sources: [],
          tags: ['demo'],
          lyrics: null,
          explicit: false
        }
      ],
      playlists: [
        {
          id: 'pl-demo',
          name: 'Demo Playlist',
          cover: 'https://via.placeholder.com/300x300/C7A26A/0B0B0D?text=Demo',
          trackIds: ['fallback-1']
        }
      ]
    }
  }
  
  // Validate track sources
  async validateTrackSource(source) {
    try {
      const response = await fetch(source.url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }
  
  // Get embed URL for supported platforms
  getEmbedUrl(url) {
    // Archive.org
    if (url.includes('archive.org')) {
      return url.replace('/details/', '/embed/')
    }
    
    // Bandcamp
    if (url.includes('bandcamp.com')) {
      return `${url}/`
    }
    
    // SoundCloud (would need oEmbed API)
    if (url.includes('soundcloud.com')) {
      return null // Implement oEmbed integration
    }
    
    return null
  }
  
  // Clear cache
  clearCache() {
    this.cache.clear()
  }
  
  // Preload critical resources
  async preloadResources(tracks) {
    const preloadPromises = []
    
    // Preload first track cover
    if (tracks.length > 0 && tracks[0].cover) {
      preloadPromises.push(this.preloadImage(tracks[0].cover))
    }
    
    // Preload first few track sources
    tracks.slice(0, 3).forEach(track => {
      if (track.sources?.length > 0) {
        const audioSource = track.sources.find(s => s.type === 'audio')
        if (audioSource) {
          preloadPromises.push(this.preloadAudio(audioSource.url))
        }
      }
    })
    
    await Promise.allSettled(preloadPromises)
  }
  
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
  }
  
  preloadAudio(src) {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.addEventListener('canplaythrough', resolve, { once: true })
      audio.addEventListener('error', resolve, { once: true })
      audio.preload = 'metadata'
      audio.src = src
    })
  }
}

export const musicService = new MusicService()

