import React from 'react';
import { 
  Building2, 
  Zap, 
  Users, 
  Search, 
  Sparkles 
} from 'lucide-react';
import { Agent } from '../types';

interface MobileBottomNavProps {
  currentViewMode: '3d' | '2.5d' | 'cards';
  onSelectViewMode: (mode: '3d' | '2.5d' | 'cards') => void;
  onOpenDirectCommand: () => void;
  onOpenNewTask: () => void;
  onOpenTeamDrawer: () => void;
  onScrollToSearch: () => void;
  onScrollToOffice: () => void;
  activeTasksCount: number;
  agents: Agent[];
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentViewMode,
  onSelectViewMode,
  onOpenDirectCommand,
  onOpenNewTask,
  onOpenTeamDrawer,
  onScrollToSearch,
  onScrollToOffice,
  activeTasksCount
}) => {
  return (
    <nav 
      aria-label="Navigasi Bawah Layar HP"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center gap-1">
        
        {/* 1. KANTOR 3D */}
        <button
          onClick={() => {
            if (currentViewMode !== '3d') onSelectViewMode('3d');
            onScrollToOffice();
          }}
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            currentViewMode === '3d'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Building2 className="h-5 w-5" />
            {currentViewMode === '3d' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">Kantor 3D</span>
        </button>

        {/* 2. PERINTAH CEPAT (MANDAT) */}
        <button
          onClick={onOpenDirectCommand}
          type="button"
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-amber-400 hover:text-amber-300 transition-all active:scale-95"
        >
          <div className="relative">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/40">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
            </div>
          </div>
          <span className="text-[10px] mt-1 font-bold tracking-tight leading-none">Mandat</span>
        </button>

        {/* 3. TUGAS BARU (+ TUGAS) - HERO CENTER ACTION */}
        <button
          onClick={onOpenNewTask}
          type="button"
          className="flex flex-col items-center justify-center -mt-3 active:scale-95 transition-all"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/40 border-2 border-slate-900 ring-2 ring-blue-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-[10px] mt-1 font-extrabold text-blue-300 leading-none">
            {activeTasksCount > 0 ? `+ Tugas (${activeTasksCount})` : '+ Tugas'}
          </span>
        </button>

        {/* 4. CARI MULTI-AI */}
        <button
          onClick={onScrollToSearch}
          type="button"
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all active:scale-95"
        >
          <Search className="h-5 w-5 text-slate-300" />
          <span className="text-[10px] mt-1 tracking-tight leading-none">Cari AI</span>
        </button>

        {/* 5. 10 KARYAWAN AI */}
        <button
          onClick={onOpenTeamDrawer}
          type="button"
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all active:scale-95"
        >
          <Users className="h-5 w-5 text-emerald-400" />
          <span className="text-[10px] mt-1 tracking-tight leading-none">10 Agen</span>
        </button>

      </div>
    </nav>
  );
};
