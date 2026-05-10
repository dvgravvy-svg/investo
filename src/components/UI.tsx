import React, { Component } from 'react';
import { cn } from '../lib/utils';

export class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, errorInfo: string | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      let message = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.errorInfo || '');
        if (parsed.error) message = `Database Error: ${parsed.error}`;
      } catch (e) {}

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <Card className="max-w-md w-full border-rose-500/50">
            <h2 className="text-2xl font-black text-white mb-4">Oops!</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            <Button onClick={() => window.location.reload()} className="w-full">Reload App</Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Button = ({ children, onClick, className, variant = 'primary', disabled }: any) => {
  const variants: any = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50',
    secondary: 'bg-slate-800 text-indigo-400 border border-indigo-500/30 hover:bg-slate-700 disabled:opacity-50',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50'
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('px-4 py-2 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2', variants[variant], className)}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className }: any) => (
  <div className={cn('bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm', className)}>
    {children}
  </div>
);
