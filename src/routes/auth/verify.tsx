import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, ExternalLink, RefreshCw, 
  ArrowLeft, CheckCircle2, AlertCircle,
  ShieldCheck, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth/verify')({
  component: AuthVerifyPage,
});

function AuthVerifyPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/verify' }) as any;
  const email = search.email || '';
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      toast.success("Verification email sent!");
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  const openGmail = () => {
    window.open('https://mail.google.com/', '_blank');
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f] text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong p-8 sm:p-12 rounded-[3rem] border border-white/10 text-center space-y-8 relative z-10"
      >
        <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
          <Mail className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground/60 text-sm leading-relaxed">
            We've sent a verification link to <span className="text-foreground font-bold">{email}</span>. 
            Please check your inbox to continue.
          </p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={openGmail}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            Open Gmail
            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button 
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="w-full py-4 glass hover:bg-white/5 rounded-2xl font-bold text-sm border border-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification'}
          </button>
        </div>

        <div className="pt-4 flex flex-col items-center gap-4">
          <button 
            onClick={() => navigate({ to: '/' })}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to login
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Ramaibot Secure Authentication</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
