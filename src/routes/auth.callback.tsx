import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Zap } from 'lucide-react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        
        // Successfully authenticated, redirect to home
        navigate({ to: '/' })
      } catch (error) {
        console.error('Error during auth callback:', error)
        // If there's an error, redirect to home where AuthGuard will handle showing Login
        navigate({ to: '/' })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[140px] animate-mesh rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-accent/10 blur-[140px] animate-mesh delay-1000 rounded-full mix-blend-screen" />
      </div>
      
      <div className="z-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center shadow-inner relative group animate-pulse">
          <Zap className="w-8 h-8 text-primary" />
          <div className="absolute inset-0 bg-primary/20 blur-lg opacity-50" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">Completing authentication...</h2>
          <p className="text-muted-foreground text-sm">Just a moment while we set things up.</p>
        </div>
        <Loader2 className="w-6 h-6 text-primary animate-spin mt-2" />
      </div>
    </div>
  )
}
