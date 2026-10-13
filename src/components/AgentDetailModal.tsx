import React, { useState } from 'react';
import { Agent } from '../types';
import { AgentAvatar3D } from './AgentAvatar3D';
import { 
  X, 
  Send, 
  Settings2, 
  Save, 
  Award, 
  Check, 
  Cpu 
} from 'lucide-react';

interface AgentDetailModalProps {
  agent: Agent | null;
  onClose: () => void;
  onUpdateAgent: (updated: Agent) => void;
  onAssignTask: (agent: Agent) => void;
  onOpenDirectCommand?: (agent: Agent) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onUpdateAgent,
  onAssignTask,
  onOpenDirectCommand
}) => {
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt || '');
  const [role, setRole] = useState(agent?.role || '');
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (agent) {
      setSystemPrompt(agent.systemPrompt);
      setRole(agent.role);
    }
  }, [agent]);

  if (!agent) return null;

  const handleSave = () => {
    onUpdateAgent({
      ...agent,
      role,
      systemPrompt
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: agent.color }}
            />
            <h2 className="text-lg font-extrabold text-slate-900">Profil Karyawan AI Virtual</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          
          {/* Top Hero Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <AgentAvatar3D agent={agent} size="lg" isWorking={agent.status === 'working'} />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">{agent.name}</h3>
                <span 
                  className="px-2.5 py-0.5 text-xs font-bold rounded-full"
                  style={{
                    backgroundColor: `${agent.color}15`,
                    color: agent.color,
                    border: `1px solid ${agent.color}35`
                  }}
                >
                  {agent.department}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-1">{agent.role}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">{agent.bio}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-mono text-emerald-600 font-bold">
                  <Award className="h-3.5 w-3.5" /> {agent.tasksCompleted} Tugas Selesai
                </span>
                <span className="flex items-center gap-1 font-mono text-blue-600 font-bold">
                  <Cpu className="h-3.5 w-3.5" /> Model: {agent.model}
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated AI Engine Details Card */}
          {agent.apiEngine && (
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-sky-50/70 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{agent.apiEngine.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {agent.apiEngine.engineName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                        {agent.apiEngine.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Provider: {agent.apiEngine.provider} • {agent.apiEngine.category}
                    </span>
                  </div>
                </div>

                {onOpenDirectCommand && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDirectCommand(agent);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all hover:scale-102"
                  >
                    <span>⚡</span>
                    <span>Tanya Mesin AI Ini</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {agent.apiEngine.description}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500">Kapabilitas API:</span>
                {agent.apiEngine.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs"
                  >
                    ✓ {cap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specialization Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Keahlian & Spesialisasi Kerja
            </h4>
            <div className="flex flex-wrap gap-2">
              {agent.skills.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Role & System Prompt Tuning */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Instruksi Sistem & Karakter Agen (System Prompt)</span>
              </h4>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                {isSaved ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Jabatan / Role:</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">System Instructions / SOP Pribadi Agen:</label>
              <textarea
                rows={4}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Tutup
          </button>
          
          <div className="flex items-center gap-2">
            {onOpenDirectCommand && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDirectCommand(agent);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all"
              >
                <span>⚡</span>
                <span>Beri Perintah Langsung</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onAssignTask(agent);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Delegasikan Tugas Tim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
