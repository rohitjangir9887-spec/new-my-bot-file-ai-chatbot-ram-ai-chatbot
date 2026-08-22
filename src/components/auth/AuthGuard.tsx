import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';

import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

import { Session } from '@supabase/supabase-js';
import { Mail, Lock, User, Globe, ArrowRight, Loader2, Zap, AlertCircle, ChevronLeft } from 'lucide-react';
import { toast } from "sonner";
import { useChatStore } from '@/lib/chat/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeType, setWelcomeType] = useState<'back' | 'new'>('back');
  const [isHydrated, setIsHydrated] = useState(false);

  const { initialize } = useChatStore();

  useEffect(() => {
    let mounted = true;
    setIsHydrated(true);

    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (currentSession) {
          setSession(currentSession);
          await initialize();
          
          // Only show welcome back once, right after an actual successful login
          const pendingWelcome = sessionStorage.getItem('ramaibot_show_welcome') === '1';
          const isFromAuth = pendingWelcome ||
                            window.location.search.includes('code=') ||
                            window.location.pathname === '/auth/callback';

          if (isFromAuth) {
            sessionStorage.removeItem('ramaibot_show_welcome');
            setWelcomeType('back');
            setShowWelcome(true);
            setTimeout(() => { if (mounted) setShowWelcome(false); }, 3000);
            
            // Clear URL params to prevent re-triggering welcome on refresh
            window.history.replaceState(null, '', window.location.pathname);
          }

        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      
      setSession(currentSession);
      
      if (currentSession && event === 'SIGNED_IN') {
        await initialize();
        
        // Distinguish new user
        const isNewUser = currentSession.user.created_at === currentSession.user.last_sign_in_at || 
                         (new Date(currentSession.user.last_sign_in_at!).getTime() - new Date(currentSession.user.created_at).getTime() < 5000);
        
        setWelcomeType(isNewUser ? 'new' : 'back');
        setShowWelcome(true);
        setTimeout(() => { if (mounted) setShowWelcome(false); }, 3000);
      }
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setShowWelcome(false);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialize]);

  // Prevent hydration mismatch
  if (!isHydrated) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#0a0a0f] relative overflow-hidden">
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
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60 animate-pulse">Initializing Ramaibot</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthUI />;
  }

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none"
          >
            <div className="glass-strong p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm mx-4 bg-[#0a0a0f]/80 backdrop-blur-3xl">
              <div className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/20 flex items-center justify-center shadow-inner relative animate-float">
                <Zap className="w-10 h-10 text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-50" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  {welcomeType === 'new' ? 'Welcome to Ramaibot' : 'Welcome Back'}
                </h2>
                <p className="text-muted-foreground mt-1 font-medium">
                  {welcomeType === 'new' ? 'Intelligence starts here.' : 'Good to see you again.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );

}

function AuthUI() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            navigate({ to: '/auth/verify', search: { email } });
            return;
          }
          throw error;
        }
      } else if (mode === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        
        if (error) throw error;
        
        if (data?.user && !data.session) {
          navigate({ to: '/auth/verify', search: { email } });
        } else if (data?.session) {
          toast.success("Account created!");
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset instructions sent to your email.");
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      toast.error(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth/callback`,
        extraParams: { prompt: "select_account" },
      });

      if (result.error) throw result.error;
      if (result.redirected) return;

      sessionStorage.setItem("ramaibot_show_welcome", "1");
      navigate({ to: "/" });
    } catch (err: any) {
      const message = err?.message?.length && err.message.length < 150
        ? err.message
        : "Google sign-in couldn't be completed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };




  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-background relative overflow-hidden selection:bg-primary/30 pb-safe">
      {/* Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[140px] animate-mesh rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-accent/10 blur-[140px] animate-mesh delay-1000 rounded-full mix-blend-screen" />
      </div>

      <div className="w-full max-w-md z-10 animate-rise-in px-4">
        <div className="glass-strong p-6 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-shadow-glass relative overflow-hidden">
          {/* Subtle logo in background */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="text-center mb-10 relative">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
              <Zap className="w-10 h-10 text-primary relative z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent tracking-tight mb-2">
              {mode === 'login' && 'Ramaibot'}
              {mode === 'signup' && 'Join Ramaibot'}
              {mode === 'forgot' && 'Reset Access'}
            </h1>
            <p className="text-muted-foreground/60 text-sm font-medium tracking-wide">
              {mode === 'login' && 'Your premium AI companion'}
              {mode === 'signup' && 'Start your journey with intelligence'}
              {mode === 'forgot' && 'Verification required to reset'}
            </p>
          </div>


          {error && (
            <div className="mb-6 p-3.5 glass-strong border-red-500/20 bg-red-500/5 rounded-2xl flex items-center gap-3 text-red-400 text-xs animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60 group-focus-within:opacity-100 transition-opacity" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-bold tracking-[0.05em] uppercase text-primary/70 hover:text-primary transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-60 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:brightness-110 text-primary-foreground font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group press active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
                  <span className="bg-[#1a1a2e] px-4 text-muted-foreground/40">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 press active:scale-[0.98] group disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <>
                    <Globe className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                    <span className="text-[15px]">Continue with Google</span>
                  </>
                )}
              </button>




            </>
          )}

          <div className="text-center mt-8">
            {mode === 'forgot' ? (
              <button
                onClick={() => setMode('login')}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to sign in
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError(null);
                  }}
                  className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        </div>
        
        <p className="text-center mt-8 text-[11px] text-muted-foreground/30 uppercase tracking-[0.2em] font-bold">
          Ramaibot Premium Intelligence
        </p>
      </div>
    </div>
  );
}

