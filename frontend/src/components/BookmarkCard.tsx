'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
}

export default function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDelete = async () => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', bookmark.id)
    if (error) {
      console.error('Error deleting bookmark:', error)
      alert('Failed to delete bookmark')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {bookmark.title}
          </h3>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate block mt-1"
          >
            {bookmark.url}
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {mounted ? new Date(bookmark.created_at).toLocaleDateString() : ''}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
          aria-label="Delete bookmark"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
