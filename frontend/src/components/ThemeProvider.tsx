'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => {},
})

export function ThemeProvider({ children, initialTheme = 'dark' }: { children: React.ReactNode, initialTheme?: string }) {
    const [theme, setTheme] = useState<Theme>(initialTheme as Theme)

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.cookie = `theme=${newTheme}; path=/; max-age=31536000` // 1 year
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    return context
}
