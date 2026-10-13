import React from 'react';
import { User } from 'firebase/auth';
import { 
  Building2, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  LogIn, 
  LogOut, 
  User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenNewTask: () => void;
  onOpenProviders: () => void;
  onOpenDocs: () => void;
  onOpenDirectCommand?: () => void;
  onOpenFreeApi?: () => void;
  activeTasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  onOpenNewTask,
  onOpenProviders,
  onOpenDocs,
  onOpenDirectCommand,
  onOpenFreeApi,
  activeTasksCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                AI Employee Office
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Virtual Office Multi-Agent Collaboration Hub
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Docs & Setup Guide */}
          <button
            onClick={onOpenDocs}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Dokumentasi Instalasi, API & Pengujian"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden md:inline">Panduan & Setup</span>
          </button>

          {/* Providers & API Status */}
          <button
            onClick={onOpenProviders}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Pengaturan Provider & API Key"
          >
            <Cpu className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden md:inline">Status Provider</span>
          </button>

          {/* Free API Playground */}
          {onOpenFreeApi && (
            <button
              onClick={onOpenFreeApi}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="Akses REST API Gratis Google Gemini untuk Otomatisasi"
            >
              <span>🔌</span>
              <span className="hidden sm:inline">API Gratis</span>
            </button>
          )}

          {/* Direct Agent Command */}
          {onOpenDirectCommand && (
            <button
              onClick={onOpenDirectCommand}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all hover:scale-102"
              title="Perintah Agen Tertentu Secara Langsung"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Perintah Agen</span>
            </button>
          )}

          {/* New Task Dispatch Button */}
          <button
            onClick={onOpenNewTask}
            type="button"
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>+ Tugas Baru</span>
            {activeTasksCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/30 text-[10px] font-mono">
                {activeTasksCount}
              </span>
            )}
          </button>

          {/* User Auth Section */}
          <div className="pl-2 border-l border-slate-200">
            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Director'}
                    className="h-8 w-8 rounded-full border border-blue-500 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-bold text-xs">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                    {user.displayName || 'Direktur'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">Firestore Aktif</p>
                </div>
                <button
                  onClick={onLogout}
                  type="button"
                  className="p-1.5 text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100"
                  title="Keluar Akun"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
                title="Masuk dengan Google Akun"
              >
                <LogIn className="h-3.5 w-3.5 text-blue-300" />
                <span className="hidden sm:inline">Masuk Google</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
