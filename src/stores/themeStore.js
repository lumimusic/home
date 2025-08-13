import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const themes = {
  'luxe-dark': {
    id: 'luxe-dark',
    name: 'Luxe Dark',
    primary: '#C7A26A',
    bg: '#0E0F13',
    surface: '#14151C',
    muted: '#9BA3AF',
    className: '',
  },
  'porcelain-light': {
    id: 'porcelain-light',
    name: 'Porcelain Light',
    primary: '#14151C',
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    muted: '#6B7280',
    className: 'theme-light',
  },
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      currentTheme: 'luxe-dark',
      themes,
      
      setTheme: (themeId) => {
        const theme = themes[themeId]
        if (!theme) return
        
        // Update CSS custom properties
        const root = document.documentElement
        root.style.setProperty('--primary', theme.primary)
        root.style.setProperty('--bg', theme.bg)
        root.style.setProperty('--surface', theme.surface)
        root.style.setProperty('--muted', theme.muted)
        
        // Update body class
        document.body.className = document.body.className
          .replace(/theme-\w+/g, '')
          .trim()
        
        if (theme.className) {
          document.body.classList.add(theme.className)
        }
        
        set({ currentTheme: themeId })
      },
      
      toggleTheme: () => {
        const { currentTheme } = get()
        const newTheme = currentTheme === 'luxe-dark' ? 'porcelain-light' : 'luxe-dark'
        get().setTheme(newTheme)
      },
      
      getCurrentTheme: () => {
        const { currentTheme } = get()
        return themes[currentTheme]
      },
    }),
    {
      name: 'aurora-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on app load
          state.setTheme(state.currentTheme)
        }
      },
    }
  )
)

