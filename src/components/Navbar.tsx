import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  Building2, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Zap
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/20 shrink-0">
            <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-extrabold tracking-tight text-slate-900 truncate">
                AI Employee Office
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-blue-600 border border-blue-200 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block truncate">
              Virtual Office Multi-Agent Collaboration Hub
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Docs & Setup Guide - Desktop */}
          <button
            onClick={onOpenDocs}
            type="button"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Dokumentasi Instalasi, API & Pengujian"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span>Panduan & Setup</span>
          </button>

          {/* Providers & API Status - Desktop */}
          <button
            onClick={onOpenProviders}
            type="button"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Pengaturan Provider & API Key"
          >
            <Cpu className="h-3.5 w-3.5 text-purple-600" />
            <span>Status Provider</span>
          </button>

          {/* Free API Playground - Desktop */}
          {onOpenFreeApi && (
            <button
              onClick={onOpenFreeApi}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="Akses REST API Gratis Google Gemini untuk Otomatisasi"
            >
              <span>🔌</span>
              <span>API Gratis</span>
            </button>
          )}

          {/* Direct Agent Command - Desktop */}
          {onOpenDirectCommand && (
            <button
              onClick={onOpenDirectCommand}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all hover:scale-102"
              title="Perintah Agen Tertentu Secara Langsung"
            >
              <span>⚡</span>
              <span>Perintah Agen</span>
            </button>
          )}

          {/* New Task Dispatch Button */}
          <button
            onClick={onOpenNewTask}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">+ Tugas</span>
            <span className="xs:hidden">+</span>
            {activeTasksCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white/30 text-[10px] font-mono">
                {activeTasksCount}
              </span>
            )}
          </button>

          {/* User Auth Section - Desktop */}
          <div className="hidden sm:flex items-center pl-1 sm:pl-2 border-l border-slate-200">
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

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Menu Opsi HP"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Slide-down Menu Dropdown (HP Compatible) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenDocs();
                setMobileMenuOpen(false);
              }}
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200 text-left"
            >
              <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Panduan Setup</span>
            </button>

            <button
              onClick={() => {
                onOpenProviders();
                setMobileMenuOpen(false);
              }}
              type="button"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200 text-left"
            >
              <Cpu className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Status Provider</span>
            </button>

            {onOpenFreeApi && (
              <button
                onClick={() => {
                  onOpenFreeApi();
                  setMobileMenuOpen(false);
                }}
                type="button"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 border border-emerald-200 text-left"
              >
                <span>🔌</span>
                <span>REST API Gratis</span>
              </button>
            )}

            {onOpenDirectCommand && (
              <button
                onClick={() => {
                  onOpenDirectCommand();
                  setMobileMenuOpen(false);
                }}
                type="button"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 border border-amber-300 text-left"
              >
                <span>⚡</span>
                <span>Perintah Agen</span>
              </button>
            )}
          </div>

          {/* User Auth inside Mobile Menu */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-7 w-7 rounded-full border border-blue-500" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                    {user.displayName || 'Direktur'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold border border-red-200 flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLogin();
                  setMobileMenuOpen(false);
                }}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs"
              >
                <LogIn className="h-4 w-4 text-blue-300" />
                <span>Masuk dengan Google (Sinkronisasi Cloud)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
