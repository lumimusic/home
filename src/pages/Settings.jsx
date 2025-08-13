import { useThemeStore } from '../stores/themeStore'
import { usePlayerStore } from '../stores/playerStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { clsx } from 'clsx'

const Settings = () => {
  const { 
    currentTheme, 
    themes, 
    setTheme, 
    toggleTheme 
  } = useThemeStore()
  
  const {
    volume,
    playbackRate,
    crossfade,
    showVisualizer,
    setVolume,
    setPlaybackState,
    toggleVisualizer,
  } = usePlayerStore()
  
  const handlePlaybackRateChange = (rate) => {
    setPlaybackState({ playbackRate: rate })
  }
  
  const handleCrossfadeChange = (fade) => {
    setPlaybackState({ crossfade: fade })
  }
  
  const hotkeyHints = [
    { key: 'Space', description: 'Play/Pause' },
    { key: '←/→', description: 'Seek ±5s' },
    { key: 'Shift + ←/→', description: 'Previous/Next track' },
    { key: '↑/↓', description: 'Volume ±10%' },
    { key: 'L', description: 'Toggle lyrics' },
    { key: 'Q', description: 'Toggle queue' },
    { key: 'R', description: 'Cycle repeat mode' },
    { key: 'S', description: 'Toggle shuffle' },
    { key: 'M', description: 'Mute/unmute' },
    { key: '0-9', description: 'Seek to 0%-90%' },
    { key: '+/-', description: 'Playback rate ±0.25x' },
  ]
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-white mb-8">
        Cài đặt
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-white">Giao diện</h2>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div>
              <p className="text-text-muted text-sm mb-3">Chọn theme</p>
              <div className="space-y-2">
                {Object.values(themes).map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={clsx(
                      "w-full p-3 rounded-lg border text-left transition-colors",
                      currentTheme === theme.id
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/20 text-text-muted hover:border-primary hover:text-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{theme.name}</span>
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.bg }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              onClick={toggleTheme}
              className="w-full"
            >
              Chuyển đổi nhanh
            </Button>
          </Card.Content>
        </Card>
        
        {/* Audio Settings */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-white">Âm thanh</h2>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div>
              <label className="block text-text-muted text-sm mb-2">
                Âm lượng mặc định: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <label className="block text-text-muted text-sm mb-2">
                Tốc độ phát: {playbackRate}x
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                  <Button
                    key={rate}
                    variant={playbackRate === rate ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handlePlaybackRateChange(rate)}
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-text-muted text-sm mb-2">
                Crossfade: {crossfade}s
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={crossfade}
                onChange={(e) => handleCrossfadeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">Hiển thị visualizer</span>
              <button
                onClick={toggleVisualizer}
                className={clsx(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  showVisualizer ? "bg-primary" : "bg-white/20"
                )}
              >
                <span
                  className={clsx(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    showVisualizer ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </Card.Content>
        </Card>
        
        {/* Keyboard Shortcuts */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <h2 className="font-semibold text-white">Phím tắt</h2>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotkeyHints.map(hint => (
                <div key={hint.key} className="flex items-center justify-between py-2">
                  <span className="text-text-muted text-sm">{hint.description}</span>
                  <kbd className="px-2 py-1 bg-background-surface border border-white/20 rounded text-xs text-white font-mono">
                    {hint.key}
                  </kbd>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
        
        {/* About */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <h2 className="font-semibold text-white">Về Aurora Luxe Music</h2>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center">
                <span className="text-2xl font-display text-primary-contrast">A</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">
                Aurora Luxe Music
              </h3>
              <p className="text-text-muted text-sm mb-4">
                Trải nghiệm nghe nhạc sang trọng và đẳng cấp
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">v1.0.0</p>
                <p className="text-text-muted text-xs">Phiên bản</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">2024</p>
                <p className="text-text-muted text-xs">Năm phát hành</p>
              </div>
            </div>
            
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-text-muted text-xs">
                Được xây dựng với ❤️ sử dụng React, Vite, TailwindCSS
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default Settings

