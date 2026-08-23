import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = { hasError: false, error: null };
  public static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  public override componentDidCatch(_error: Error, _errorInfo: ErrorInfo) { console.error('Ramaibot UI error boundary triggered'); }
  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <div className="min-h-[200px] w-full flex flex-col items-center justify-center p-6 glass rounded-2xl border-red-500/20 bg-red-500/5 animate-rise-in text-center"><AlertCircle className="w-8 h-8 text-red-400 mb-4" /><h2 className="text-lg font-bold mb-2">Something went wrong</h2><p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">The application encountered an unexpected error.</p><button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all"><RotateCcw className="w-4 h-4" />Reload Page</button></div>;
    }
    return this.props.children;
  }
}
