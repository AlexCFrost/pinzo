'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

interface Bookmark {
    id: string
    title: string
    url: string
    created_at: string
    user_id: string
}

export default function DashboardClient({ user, initialBookmarks }: { user: any, initialBookmarks: Bookmark[] | null }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks || [])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; bookmarkId: string | null }>({ show: false, bookmarkId: null })
    const router = useRouter()

    // Set up real-time subscription for bookmark changes across tabs
    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel('bookmarks')
            .on('broadcast', { event: 'bookmark_changes' }, (payload) => {
                const { type, record, old_record } = payload.payload

                if (type === 'INSERT' && record) {
                    if (record.user_id === user.id) {
                        setBookmarks((current) => [record as Bookmark, ...current])
                    }
                } else if (type === 'DELETE' && old_record) {
                    setBookmarks((current) =>
                        current.filter((bookmark) => bookmark.id !== old_record.id)
                    )
                } else if (type === 'UPDATE' && record) {
                    if (record.user_id === user.id) {
                        setBookmarks((current) =>
                            current.map((bookmark) =>
                                bookmark.id === record.id ? (record as Bookmark) : bookmark
                            )
                        )
                    }
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user.id])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    const handleSave = async () => {
        if (!title || !url) return
        setLoading(true)
        
        const supabase = createClient()
        const { error } = await supabase.from('bookmarks').insert({
            title,
            url,
            user_id: user.id
        })

        if (!error) {
            setTitle('')
            setUrl('')
        }
        setLoading(false)
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()

        setDeleteModal({ show: true, bookmarkId: id })
    }

    const confirmDelete = async () => {
        if (!deleteModal.bookmarkId) return

        const supabase = createClient()
        await supabase.from('bookmarks').delete().eq('id', deleteModal.bookmarkId)
        setDeleteModal({ show: false, bookmarkId: null })
    }

    const cancelDelete = () => {
        setDeleteModal({ show: false, bookmarkId: null })
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
            {/* Delete confirmation modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={cancelDelete}
                    ></div>
                    
                    <div className="relative bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-round text-red-500 text-2xl">delete_outline</span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Bookmark?</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                This action cannot be undone. Are you sure you want to delete this bookmark?
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-background-dark hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="glass-nav">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex items-center space-x-2.5">
                            <Logo className="w-8 h-auto" />
                            <span className="font-bold text-xl tracking-tight">Pinzo</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button
                            onClick={handleSignOut}
                            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            Sign Out
                        </button>
                        {user.user_metadata?.avatar_url && (
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-border-dark">
                                <img
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    src={user.user_metadata.avatar_url}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto min-h-screen flex flex-col">
                <div className="mb-20">
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-2 rounded-xl shadow-xl shadow-primary/5">
                        <div className="flex flex-col md:flex-row items-center gap-2">
                            <div className="flex-1 w-full flex items-center px-4 py-2 bg-slate-50 dark:bg-background-dark/50 rounded-lg">
                                <span className="material-icons-round text-slate-400 dark:text-slate-500 mr-3 text-lg">title</span>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 w-full text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                                    placeholder="Title (e.g. Design Inspiration)"
                                    type="text"
                                />
                            </div>
                            <div className="flex-[2] w-full flex items-center px-4 py-2 bg-slate-50 dark:bg-background-dark/50 rounded-lg">
                                <span className="material-icons-round text-slate-400 dark:text-slate-500 mr-3 text-lg">link</span>
                                <input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 w-full text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                                    placeholder="Paste URL here..."
                                    type="text"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                            >
                                <span className="material-icons-round mr-2 text-base">add</span>
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold flex items-center opacity-70">
                            <span className="material-icons-round text-[14px] mr-1.5 text-primary">bolt</span>
                            Your focus, organized.
                        </p>
                    </div>
                </div>

                {bookmarks.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center relative -mt-12">
                        <div className={`gradient-blur left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}></div>
                        <div className="text-center max-w-sm mx-auto">
                            <div className="mb-8 relative inline-block">
                                <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto relative z-10 border border-primary/10">
                                    <span className="material-symbols-outlined text-primary text-4xl opacity-80">folder_open</span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-dark border border-border-dark rounded-full flex items-center justify-center shadow-sm">
                                    <span className="material-icons-round text-primary text-[10px]">priority_high</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">Your library is empty</h1>
                            <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed text-sm">
                                Clean space, clean mind. Start building your personal knowledge base by adding your first bookmark above.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarks.map((bookmark) => (
                            <a
                                key={bookmark.id}
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 hover:border-primary/50 transition-all relative"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                                        <span className="material-icons-round text-xl">language</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={(e) => handleDelete(e, bookmark.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Delete bookmark"
                                        >
                                            <span className="material-icons-round text-xl">delete_outline</span>
                                        </button>
                                        <span className="material-icons-round text-slate-400 group-hover:text-primary transition-colors">arrow_outward</span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">{bookmark.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{bookmark.url}</p>
                            </a>
                        ))}
                    </div>
                )}

            </main>
        </div>
    )
}
