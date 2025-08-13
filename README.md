# Aurora Luxe Music 🎵

Trải nghiệm nghe nhạc sang trọng và đẳng cấp với giao diện hiện đại, mượt mà.

## ✨ Tính năng nổi bật

### 🎨 Giao diện sang trọng
- **Design System**: Màu sắc và typography được thiết kế tỉ mỉ theo phong cách luxury
- **Glassmorphism**: Hiệu ứng kính mờ hiện đại
- **Dark/Light Theme**: Chuyển đổi theme mượt mà
- **Responsive**: Tối ưu cho mọi thiết bị

### 🎵 Trình phát nhạc mạnh mẽ
- **Multi-source Support**: Hỗ trợ audio trực tiếp và iframe embeds (archive.org)
- **Advanced Controls**: Play/pause, seek, volume, repeat, shuffle, playback rate
- **Queue Management**: Kéo thả để sắp xếp, lưu thành playlist
- **Media Session API**: Tích hợp với media controls của hệ điều hành

### 🎤 Karaoke & Lyrics
- **LRC Support**: Hiển thị lời bài hát đồng bộ thời gian
- **Auto-scroll**: Tự động cuộn theo tiến độ bài hát
- **Fallback**: Hỗ trợ plain text khi không có LRC

### 🔍 Tìm kiếm thông minh
- **Fuzzy Search**: Tìm kiếm mờ, chấp nhận lỗi chính tả
- **Advanced Filters**: Lọc theo thể loại, nghệ sĩ, năm
- **Keyboard Shortcut**: Nhấn '/' để focus vào search bar

### 📱 PWA Ready
- **Offline Support**: Cache nhạc và hoạt động offline
- **Install Prompt**: Cài đặt như ứng dụng native
- **Background Sync**: Đồng bộ dữ liệu khi có mạng

### ⌨️ Keyboard Shortcuts
- `Space`: Play/Pause
- `←/→`: Seek ±5s
- `Shift + ←/→`: Previous/Next track
- `↑/↓`: Volume ±10%
- `L`: Toggle lyrics
- `Q`: Toggle queue
- `R`: Cycle repeat mode
- `S`: Toggle shuffle
- `0-9`: Seek to 0%-90%

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS với custom design system
- **State Management**: Zustand
- **Routing**: React Router v6
- **Audio**: HTMLAudioElement + Web Audio API
- **PWA**: Service Worker + Manifest
- **Build Tool**: Vite với code splitting

## 🚀 Cài đặt và chạy

### Prerequisites
- Node.js 18+
- npm hoặc yarn

### Development
```bash
# Clone repository
git clone <repository-url>
cd aurora-luxe-music

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Mở http://localhost:3000
```

### Production Build
```bash
# Build cho production
npm run build

# Preview build
npm run preview
```

## 📁 Cấu trúc dự án

```
src/
├── components/          # React components
│   ├── ui/             # UI components cơ bản
│   ├── navigation/     # Navigation components
│   ├── player/         # Player components
│   ├── search/         # Search components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom hooks
├── stores/             # Zustand stores
├── services/           # API services
├── utils/              # Utility functions
├── styles/             # Global styles
└── i18n/               # Internationalization

public/
├── music.json          # Music library data
├── lyrics/             # LRC files
├── icons/              # PWA icons
├── manifest.json       # PWA manifest
└── sw.js               # Service worker
```

## 🎵 Thêm nhạc vào thư viện

Chỉnh sửa file `public/music.json`:

```json
{
  "tracks": [
    {
      "id": "unique-id",
      "title": "Tên bài hát",
      "artist": "Nghệ sĩ",
      "album": "Album",
      "year": 2024,
      "cover": "https://example.com/cover.jpg",
      "duration": 0,
      "sources": [
        {
          "type": "audio",
          "url": "https://example.com/audio.mp3"
        }
      ],
      "embedUrl": "https://archive.org/embed/item-id",
      "tags": ["tag1", "tag2"],
      "lyrics": "public/lyrics/song.lrc",
      "explicit": false
    }
  ],
  "playlists": [
    {
      "id": "playlist-id",
      "name": "Tên playlist",
      "cover": "https://example.com/playlist-cover.jpg",
      "trackIds": ["track-id-1", "track-id-2"]
    }
  ]
}
```

## 🎨 Customization

### Thay đổi màu sắc
Chỉnh sửa `tailwind.config.js`:

```js
colors: {
  primary: {
    DEFAULT: '#C7A26A', // Màu chính
    contrast: '#0B0B0D', // Màu tương phản
  },
  background: {
    DEFAULT: '#0E0F13', // Màu nền
    surface: '#14151C', // Màu surface
  },
  // ...
}
```

### Thêm theme mới
Chỉnh sửa `src/stores/themeStore.js`:

```js
const themes = {
  'custom-theme': {
    id: 'custom-theme',
    name: 'Custom Theme',
    primary: '#FF6B6B',
    bg: '#1A1A2E',
    surface: '#16213E',
    muted: '#8892B0',
    className: 'theme-custom',
  },
  // ...
}
```

## 🔧 Cấu hình

### Audio Settings
- **Volume**: 0.0 - 1.0
- **Playback Rate**: 0.5x - 2.0x
- **Crossfade**: 0-10 seconds
- **Repeat**: none, one, all
- **Shuffle**: boolean

### PWA Settings
- **Cache Strategy**: Cache First với Network Fallback
- **Offline Support**: Music library và covers
- **Background Sync**: Đồng bộ khi có mạng

## 🌐 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers với Web Audio API support

## 📝 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub.

---

**Aurora Luxe Music** - Nơi âm nhạc trở nên sang trọng và đẳng cấp ✨

