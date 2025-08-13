import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../stores/libraryStore'
import { usePlayerStore } from '../stores/playerStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { clsx } from 'clsx'

// Icons
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const HeartIcon = ({ filled }) => (
  <svg className={clsx("w-4 h-4", filled ? "text-danger" : "text-text-muted")} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const ExplicitIcon = () => (
  <span className="text-xs text-text-muted bg-white/20 px-1.5 py-0.5 rounded">E</span>
)

// Hero Section Component
const HeroSection = () => {
  const navigate = useNavigate()
  const { tracks } = useLibraryStore()
  const { setQueue, setCurrentTrack } = usePlayerStore()
  
  const featuredTrack = tracks[0] // Use first track as featured
  
  const handlePlayFeatured = () => {
    if (featuredTrack) {
      setQueue([featuredTrack], 0)
      setCurrentTrack(featuredTrack)
      navigate('/player')
    }
  }
  
  if (!featuredTrack) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-primary/20 to-background-surface rounded-aurora overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-white mb-4">
              Aurora Luxe Music
            </h1>
            <p className="text-text-muted mb-6">
              Trải nghiệm nghe nhạc sang trọng và đẳng cấp
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative h-96 rounded-aurora overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={featuredTrack.cover} 
          alt={featuredTrack.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative h-full flex items-end p-8">
        <div className="max-w-2xl">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
              Nổi bật
            </span>
          </div>
          
          <h1 className="font-display text-4xl font-bold text-white mb-2 text-shadow">
            {featuredTrack.title}
          </h1>
          
          <p className="text-lg text-white/90 mb-1 text-shadow">
            {featuredTrack.artist}
          </p>
          
          <p className="text-text-muted mb-6">
            {featuredTrack.album} • {featuredTrack.year}
          </p>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePlayFeatured}
              size="lg"
              className="shadow-aurora-glow"
            >
              <PlayIcon />
              Phát ngay
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/library')}
            >
              Khám phá thêm
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Playlist Card Component
const PlaylistCard = ({ playlist, tracks }) => {
  const navigate = useNavigate()
  const { setQueue, setCurrentTrack } = usePlayerStore()
  
  const playlistTracks = playlist.trackIds
    .map(id => tracks.find(track => track.id === id))
    .filter(Boolean)
  
  const handlePlayPlaylist = (e) => {
    e.stopPropagation()
    if (playlistTracks.length > 0) {
      setQueue(playlistTracks, 0)
      setCurrentTrack(playlistTracks[0])
    }
  }
  
  const handleCardClick = () => {
    navigate(`/playlist/${playlist.id}`)
  }
  
  return (
    <Card 
      hover 
      className="group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-square rounded-t-aurora overflow-hidden bg-gradient-to-br from-primary/20 to-background-surface">
          {playlist.cover ? (
            <img 
              src={playlist.cover} 
              alt={playlist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <span className="text-2xl font-display text-primary-contrast">
                {playlist.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <Button
            onClick={handlePlayPlaylist}
            size="icon"
            className="w-12 h-12 shadow-aurora-glow"
          >
            <PlayIcon />
          </Button>
        </div>
      </div>
      
      <Card.Content className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">
          {playlist.name}
        </h3>
        <p className="text-text-muted text-sm">
          {playlistTracks.length} bài hát
        </p>
      </Card.Content>
    </Card>
  )
}

// Track Card Component
const TrackCard = ({ track }) => {
  const { setQueue, setCurrentTrack } = usePlayerStore()
  const { toggleLikeTrack, isTrackLiked } = useLibraryStore()
  
  const isLiked = isTrackLiked(track.id)
  
  const handlePlay = () => {
    setQueue([track], 0)
    setCurrentTrack(track)
  }
  
  const handleLike = (e) => {
    e.stopPropagation()
    toggleLikeTrack(track.id)
  }
  
  return (
    <Card 
      hover 
      className="group cursor-pointer"
      onClick={handlePlay}
    >
      <div className="relative">
        <div className="aspect-square rounded-t-aurora overflow-hidden bg-gradient-to-br from-primary/20 to-background-surface">
          {track.cover ? (
            <img 
              src={track.cover} 
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50" />
          )}
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <Button
            size="icon"
            className="w-12 h-12 shadow-aurora-glow"
          >
            <PlayIcon />
          </Button>
        </div>
        
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        >
          <HeartIcon filled={isLiked} />
        </button>
      </div>
      
      <Card.Content className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white mb-1 truncate">
              {track.title}
            </h3>
            <p className="text-text-muted text-sm truncate">
              {track.artist}
            </p>
          </div>
          
          {track.explicit && <ExplicitIcon />}
        </div>
        
        {track.tags && track.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {track.tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  )
}

// Main Home Component
const Home = () => {
  const { tracks, playlists, getTrendingTracks, getNewReleases, isLoading } = useLibraryStore()
  const [trendingTracks, setTrendingTracks] = useState([])
  const [newReleases, setNewReleases] = useState([])
  
  useEffect(() => {
    if (tracks.length > 0) {
      setTrendingTracks(getTrendingTracks(6))
      setNewReleases(getNewReleases(6))
    }
  }, [tracks, getTrendingTracks, getNewReleases])
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-background-surface rounded-aurora mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-background-surface rounded-aurora h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Playlists */}
      {playlists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-white">
              Playlist nổi bật
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/library')}
              className="text-primary hover:text-primary/80"
            >
              Xem tất cả
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.slice(0, 5).map(playlist => (
              <PlaylistCard 
                key={playlist.id} 
                playlist={playlist} 
                tracks={tracks}
              />
            ))}
          </div>
        </section>
      )}
      
      {/* Trending Tracks */}
      {trendingTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-white">
              Đang thịnh hành
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/library')}
              className="text-primary hover:text-primary/80"
            >
              Xem tất cả
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingTracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}
      
      {/* New Releases */}
      {newReleases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-white">
              Mới phát hành
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/library')}
              className="text-primary hover:text-primary/80"
            >
              Xem tất cả
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {newReleases.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}
      
      {/* Empty State */}
      {!isLoading && tracks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎵</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-white mb-2">
            Chưa có nhạc nào
          </h2>
          <p className="text-text-muted mb-6">
            Thêm nhạc vào thư viện để bắt đầu trải nghiệm Aurora Luxe
          </p>
          <Button onClick={() => navigate('/settings')}>
            Cài đặt thư viện
          </Button>
        </div>
      )}
    </div>
  )
}

export default Home

