'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import BookmarkCard from './BookmarkCard'

type Bookmark = {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

export default function BookmarkList({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[]
  userId: string
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)

  useEffect(() => {
    setBookmarks(initialBookmarks)
  }, [initialBookmarks])

  useEffect(() => {
    const supabase = createClient()

    console.log('Setting up broadcast subscription for user:', userId)

    const channel = supabase
      .channel('bookmarks')
      .on('broadcast', { event: 'bookmark_changes' }, (payload) => {
        console.log('Broadcast event received:', payload)
        
        const { type, record, old_record } = payload.payload

        if (type === 'INSERT' && record) {
          // Only add if it's for this user
          if (record.user_id === userId) {
            setBookmarks((current) => [record as Bookmark, ...current])
          }
        } else if (type === 'DELETE' && old_record) {
          setBookmarks((current) =>
            current.filter((bookmark) => bookmark.id !== old_record.id)
          )
        } else if (type === 'UPDATE' && record) {
          // Only update if it's for this user
          if (record.user_id === userId) {
            setBookmarks((current) =>
              current.map((bookmark) =>
                bookmark.id === record.id ? (record as Bookmark) : bookmark
              )
            )
          }
        }
      })
      .subscribe((status) => {
        console.log('Broadcast subscription status:', status)
      })

    return () => {
      console.log('Cleaning up broadcast subscription')
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No bookmarks yet. Add your first one above!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  )
}
