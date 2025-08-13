import { useParams, useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../stores/libraryStore'
import { usePlayerStore } from '../stores/playerStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const PlaylistDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playlists, getPlaylistTracks } = useLibraryStore()
  const { setQueue, setCurrentTrack } = usePlayerStore()
  
  const playlist = playlists.find(p => p.id === id)
  const tracks = getPlaylistTracks(id)
  
  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="font-display text-2xl font-semibold text-white mb-2">
            Không tìm thấy playlist
          </h2>
          <p className="text-text-muted mb-6">
            Playlist này có thể đã bị xóa hoặc không tồn tại
          </p>
          <Button onClick={() => navigate('/library')}>
            Về thư viện
          </Button>
        </div>
      </div>
    )
  }
  
  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks, 0)
      setCurrentTrack(tracks[0])
    }
  }
  
  const handlePlayTrack = (track, index) => {
    setQueue(tracks, index)
    setCurrentTrack(track)
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Playlist Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-48 h-48 rounded-aurora overflow-hidden bg-gradient-to-br from-primary/20 to-background-surface flex-shrink-0 mx-auto md:mx-0">
          {playlist.cover ? (
            <img 
              src={playlist.cover} 
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <span className="text-4xl font-display text-primary-contrast">
                {playlist.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <p className="text-text-muted text-sm mb-2">Playlist</p>
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            {playlist.name}
          </h1>
          <p className="text-text-muted mb-6">
            {tracks.length} bài hát
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button 
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              size="lg"
            >
              <PlayIcon />
              Phát tất cả
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => navigate('/library')}
              size="lg"
            >
              Về thư viện
            </Button>
          </div>
        </div>
      </div>
      
      {/* Track List */}
      {tracks.length > 0 ? (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <Card key={track.id} hover className="group">
              <div className="flex items-center gap-4 p-4">
                <span className="text-text-muted text-sm w-6 text-center">
                  {index + 1}
                </span>
                
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-background-surface flex-shrink-0">
                  {track.cover ? (
                    <img 
                      src={track.cover} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">
                    {track.title}
                  </h4>
                  <p className="text-text-muted text-sm truncate">
                    {track.artist} • {track.album}
                  </p>
                </div>
                
                {track.explicit && (
                  <span className="text-xs text-text-muted bg-white/20 px-1.5 py-0.5 rounded">
                    E
                  </span>
                )}
                
                <Button
                  size="icon"
                  onClick={() => handlePlayTrack(track, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <PlayIcon />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎵</span>
          </div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">
            Playlist trống
          </h3>
          <p className="text-text-muted">
            Playlist này chưa có bài hát nào
          </p>
        </div>
      )}
    </div>
  )
}

export default PlaylistDetail

