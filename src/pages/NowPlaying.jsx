import { useEffect, useState } from 'react'
import { usePlayerStore } from '../stores/playerStore'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const NowPlaying = () => {
  const navigate = useNavigate()
  const { currentTrack, showLyrics, showQueue } = usePlayerStore()
  
  useEffect(() => {
    if (!currentTrack) {
      navigate('/')
    }
  }, [currentTrack, navigate])
  
  if (!currentTrack) {
    return null
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
        {/* Main Content - Artwork */}
        <div className="lg:col-span-2 flex items-center justify-center">
          <div className="relative max-w-lg w-full aspect-square">
            <div className="w-full h-full rounded-aurora overflow-hidden shadow-aurora-soft">
              {currentTrack.cover ? (
                <img 
                  src={currentTrack.cover} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <span className="text-6xl font-display text-primary-contrast">
                    🎵
                  </span>
                </div>
              )}
            </div>
            
            {/* Track Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <h1 className="font-display text-2xl font-bold text-white mb-2 text-shadow">
                {currentTrack.title}
              </h1>
              <p className="text-lg text-white/90 text-shadow">
                {currentTrack.artist}
              </p>
              {currentTrack.album && (
                <p className="text-text-muted text-shadow">
                  {currentTrack.album} • {currentTrack.year}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lyrics Section */}
          {showLyrics && (
            <Card className="h-96 overflow-hidden">
              <Card.Header>
                <h3 className="font-semibold text-white">Lời bài hát</h3>
              </Card.Header>
              <Card.Content className="h-full overflow-y-auto">
                <div className="text-text-muted text-sm leading-relaxed">
                  <p className="mb-4">
                    Lời bài hát sẽ được hiển thị ở đây khi có sẵn.
                  </p>
                  <p className="text-xs opacity-75">
                    Tính năng karaoke với đồng bộ thời gian sẽ được cập nhật trong phiên bản tiếp theo.
                  </p>
                </div>
              </Card.Content>
            </Card>
          )}
          
          {/* Queue Section */}
          {showQueue && (
            <Card className="h-96 overflow-hidden">
              <Card.Header>
                <h3 className="font-semibold text-white">Hàng đợi</h3>
              </Card.Header>
              <Card.Content className="h-full overflow-y-auto">
                <div className="text-text-muted text-sm">
                  <p className="mb-4">
                    Danh sách phát sẽ được hiển thị ở đây.
                  </p>
                  <p className="text-xs opacity-75">
                    Tính năng kéo thả để sắp xếp lại sẽ được cập nhật trong phiên bản tiếp theo.
                  </p>
                </div>
              </Card.Content>
            </Card>
          )}
          
          {/* Track Details */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-white">Chi tiết</h3>
            </Card.Header>
            <Card.Content className="space-y-3">
              {currentTrack.tags && currentTrack.tags.length > 0 && (
                <div>
                  <p className="text-text-muted text-sm mb-2">Thể loại</p>
                  <div className="flex flex-wrap gap-2">
                    {currentTrack.tags.map(tag => (
                      <span 
                        key={tag}
                        className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {currentTrack.year && (
                <div>
                  <p className="text-text-muted text-sm">Năm phát hành</p>
                  <p className="text-white">{currentTrack.year}</p>
                </div>
              )}
              
              {currentTrack.explicit && (
                <div>
                  <p className="text-text-muted text-sm">Nội dung</p>
                  <span className="text-xs text-text-muted bg-white/20 px-2 py-1 rounded">
                    Explicit
                  </span>
                </div>
              )}
            </Card.Content>
          </Card>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/library')}
            >
              Mở thư viện
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NowPlaying

