import { useState } from 'react'
import { useLibraryStore } from '../stores/libraryStore'
import { usePlayerStore } from '../stores/playerStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { clsx } from 'clsx'

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const Library = () => {
  const [activeTab, setActiveTab] = useState('playlists')
  const { 
    tracks, 
    playlists, 
    artists, 
    albums, 
    getLikedTracks,
    getPlaylistTracks,
    isLoading 
  } = useLibraryStore()
  const { setQueue, setCurrentTrack } = usePlayerStore()
  
  const tabs = [
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'albums', label: 'Albums', count: albums.length },
    { id: 'artists', label: 'Artists', count: artists.length },
    { id: 'liked', label: 'Yêu thích', count: getLikedTracks().length },
  ]
  
  const handlePlayAll = (tracks) => {
    if (tracks.length > 0) {
      setQueue(tracks, 0)
      setCurrentTrack(tracks[0])
    }
  }
  
  const renderPlaylists = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {playlists.map(playlist => {
        const playlistTracks = getPlaylistTracks(playlist.id)
        return (
          <Card key={playlist.id} hover className="group">
            <div className="flex items-center gap-4 p-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-background-surface flex-shrink-0">
                {playlist.cover ? (
                  <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <span className="text-lg font-display text-primary-contrast">
                      {playlist.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
                <p className="text-text-muted text-sm">{playlistTracks.length} bài hát</p>
              </div>
              
              <Button
                size="icon"
                onClick={() => handlePlayAll(playlistTracks)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <PlayIcon />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
  
  const renderAlbums = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {albums.map(album => (
        <Card key={`${album.name}-${album.artist}`} hover className="group">
          <div className="aspect-square rounded-t-aurora overflow-hidden bg-gradient-to-br from-primary/20 to-background-surface">
            {album.cover ? (
              <img src={album.cover} alt={album.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50" />
            )}
          </div>
          
          <Card.Content className="p-4">
            <h3 className="font-semibold text-white truncate">{album.name}</h3>
            <p className="text-text-muted text-sm truncate">{album.artist}</p>
            <p className="text-text-muted text-xs">{album.tracks.length} bài • {album.year}</p>
          </Card.Content>
        </Card>
      ))}
    </div>
  )
  
  const renderArtists = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {artists.map(artist => (
        <Card key={artist.name} hover className="group">
          <div className="aspect-square rounded-t-aurora overflow-hidden bg-gradient-to-br from-primary/20 to-background-surface flex items-center justify-center">
            <span className="text-4xl font-display text-primary">
              {artist.name.charAt(0)}
            </span>
          </div>
          
          <Card.Content className="p-4 text-center">
            <h3 className="font-semibold text-white truncate">{artist.name}</h3>
            <p className="text-text-muted text-sm">{artist.tracks.length} bài hát</p>
          </Card.Content>
        </Card>
      ))}
    </div>
  )
  
  const renderLiked = () => {
    const likedTracks = getLikedTracks()
    
    if (likedTracks.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-danger/20 to-danger/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">❤️</span>
          </div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">
            Chưa có bài hát yêu thích
          </h3>
          <p className="text-text-muted">
            Nhấn vào biểu tượng trái tim để thêm bài hát vào danh sách yêu thích
          </p>
        </div>
      )
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">
            {likedTracks.length} bài hát yêu thích
          </h3>
          <Button onClick={() => handlePlayAll(likedTracks)}>
            <PlayIcon />
            Phát tất cả
          </Button>
        </div>
        
        {likedTracks.map((track, index) => (
          <Card key={track.id} hover className="group">
            <div className="flex items-center gap-4 p-4">
              <span className="text-text-muted text-sm w-6 text-center">
                {index + 1}
              </span>
              
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-background-surface flex-shrink-0">
                {track.cover ? (
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{track.title}</h4>
                <p className="text-text-muted text-sm truncate">{track.artist}</p>
              </div>
              
              <Button
                size="icon"
                onClick={() => {
                  setQueue([track], 0)
                  setCurrentTrack(track)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <PlayIcon />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    )
  }
  
  const renderContent = () => {
    switch (activeTab) {
      case 'playlists':
        return renderPlaylists()
      case 'albums':
        return renderAlbums()
      case 'artists':
        return renderArtists()
      case 'liked':
        return renderLiked()
      default:
        return null
    }
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-background-surface rounded-aurora" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-background-surface rounded-aurora h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-background-surface rounded-aurora p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-contrast"
                : "text-text-muted hover:text-white hover:bg-white/10"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 text-xs opacity-75">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Content */}
      {renderContent()}
      
      {/* Empty State */}
      {!isLoading && tracks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-white mb-2">
            Thư viện trống
          </h2>
          <p className="text-text-muted">
            Thêm nhạc vào thư viện để bắt đầu tổ chức bộ sưu tập của bạn
          </p>
        </div>
      )}
    </div>
  )
}

export default Library

