import React from 'react';
import { Agent } from '../types';
import { AgentAvatar3D } from './AgentAvatar3D';
import { 
  X, 
  ZoomIn, 
  Zap, 
  Sparkles, 
  UserCheck, 
  Briefcase 
} from 'lucide-react';

interface MobileTeamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onZoomToAgent: (agent: Agent) => void;
  onDirectCommand: (agent: Agent) => void;
}

export const MobileTeamDrawer: React.FC<MobileTeamDrawerProps> = ({
  isOpen,
  onClose,
  agents,
  onZoomToAgent,
  onDirectCommand
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="sm:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full bg-slate-900 border-t border-slate-700 rounded-t-3xl shadow-2xl p-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Tim 10 Karyawan AI Kantor</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Siap Kerja
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih karyawan untuk sorot meja kerja di kantor 3D atau berikan mandat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Employees List */}
        <div className="overflow-y-auto space-y-2 py-3 flex-1">
          {agents.map((ag) => {
            const isWorking = ag.status === 'working';
            return (
              <div
                key={ag.id}
                className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 transition-all active:scale-[0.99]"
                style={{ borderLeftWidth: '4px', borderLeftColor: ag.color }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <AgentAvatar3D agent={ag} size="sm" isWorking={isWorking} />
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                        isWorking ? 'bg-blue-400 animate-ping' : 'bg-emerald-400'
                      }`} 
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-white truncate">
                        {ag.name}
                      </h4>
                      {ag.apiEngine && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700 text-amber-300 font-mono">
                          {ag.apiEngine.icon}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {ag.role}
                    </p>
                    <span className="text-[9px] font-semibold text-blue-300 inline-block mt-0.5">
                      {ag.department}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Zoom to Desk */}
                  <button
                    onClick={() => {
                      onZoomToAgent(ag);
                      onClose();
                    }}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all"
                    title={`Sorot meja kerja ${ag.name}`}
                  >
                    <ZoomIn className="h-3 w-3" />
                    <span>Meja 3D</span>
                  </button>

                  {/* Direct Command */}
                  <button
                    onClick={() => {
                      onDirectCommand(ag);
                      onClose();
                    }}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold shadow-xs active:scale-95 transition-all"
                    title={`Beri mandat langsung ke ${ag.name}`}
                  >
                    <Zap className="h-3 w-3 fill-current" />
                    <span>Mandat</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Semua agen terkoneksi ke Multi-Provider Gemini, ChatGPT-4o, Claude 3.5 & Perplexity
          </p>
        </div>
      </div>
    </div>
  );
};
