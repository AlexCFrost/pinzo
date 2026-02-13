'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors border border-transparent dark:border-neutral-800"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <span className="material-icons-round text-black dark:text-white text-xl">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    )
}
