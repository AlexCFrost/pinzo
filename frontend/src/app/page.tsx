'use client'

import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import GoogleIcon from '@/components/GoogleIcon'

export default function Home() {
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    // Always use HTTPS in production, allow protocol in development
    const isProduction = process.env.NODE_ENV === 'production'
    const protocol = isProduction ? 'https' : (typeof window !== 'undefined' ? window.location.protocol : 'http')
    const host = typeof window !== 'undefined' ? window.location.host : 'pinzo.sivaganesh.in'
    const redirectUrl = `${protocol}//${host}/auth/callback`
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light font-display relative overflow-hidden">
      {/* Theme toggle button */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background gradient decoration */}
      <div className="gradient-blur left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      <main className="flex flex-col items-center justify-center w-full max-w-md px-6">

        {/* Logo and branding */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-background-light border border-border-dark rounded-2xl mb-6 shadow-xl p-4">
            <Logo className="w-full h-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Pinzo</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Your focus, organized.
          </p>
        </div>

        {/* Sign in card */}
        <div className="w-full bg-background-light border border-border-dark p-2 rounded-2xl shadow-xl shadow-primary/5">
          <div className="p-6 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to access your library</p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-50 dark:bg-neutral-900 border border-border-dark rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all duration-200"
            >
              <GoogleIcon className="w-5 h-5" />
              <span className="font-medium text-gray-700 dark:text-gray-200 text-sm group-hover:text-foreground transition-colors">
                Continue with Google
              </span>
            </button>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-12 flex items-center justify-center space-x-6 opacity-40">
          <div className="flex items-center space-x-2">
            <span className="material-icons-round text-base text-gray-400 dark:text-gray-500">verified_user</span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-icons-round text-base text-gray-400 dark:text-gray-500">bolt</span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Fast</span>
          </div>
        </div>

      </main>
    </div>
  )
}

