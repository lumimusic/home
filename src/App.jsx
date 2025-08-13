import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Library from './pages/Library'
import NowPlaying from './pages/NowPlaying'
import PlaylistDetail from './pages/PlaylistDetail'
import Settings from './pages/Settings'
import { useHotkeys } from './hooks/useHotkeys'

function App() {
  // Initialize global hotkeys
  useHotkeys()
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="library" element={<Library />} />
        <Route path="player" element={<NowPlaying />} />
        <Route path="playlist/:id" element={<PlaylistDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App

