import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import { AgentAvatar3D } from './AgentAvatar3D';
import { commandSingleAgent } from '../lib/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Cpu, 
  Clock, 
  Zap, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface DirectCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  initialAgent?: Agent | null;
  initialPrompt?: string;
  onCommandSuccess?: (agent: Agent, prompt: string, output: string) => void;
}

// Predefined specializations and prompt templates per agent
const AGENT_TEMPLATES: Record<string, { specialization: string; templates: string[] }> = {
  agent_alex: {
    specialization: 'Perencanaan Strategis, Pembagian Tugas, Roadmap Eksekutif, Manajemen Operasional',
    templates: [
      'Buatkan roadmap strategis peluncuran fitur baru kantor virtual untuk 30 hari ke depan.',
      'Susun dekomposisi mandat proyek dan pembagian peran detail untuk 5 divisi kerja.',
      'Buat ringkasan eksekutif (Executive Summary) terkait efisiensi pemanfaatan multi-agent AI di perusahaan.'
    ]
  },
  agent_maya: {
    specialization: 'Riset Pasar, Penelusuran Fakta, Analisis Tren Global, Benchmarking AI & Metodologi Ilmiah',
    templates: [
      'Riset tren adopsi teknologi Autonomous AI Agents dan AI Coworker tahun 2026 secara mendalam.',
      'Lakukan analisis komparasi benchmarking antara model AI komersial vs open-source.',
      'Analisis dataset pasar dan berikan 5 wawasan kritis untuk pengambilan keputusan manajemen.'
    ]
  },
  agent_david: {
    specialization: 'Arsitektur Sistem, Koding & Skrip Fullstack, Skema Database SQL, Cloud & DevOps',
    templates: [
      'Rancang arsitektur API microservices yang scalable dengan diagram komponen dan skema database PostgreSQL.',
      'Buat kode implementasi endpoint RESTful Express TypeScript dengan rate limiting dan error handling terstandar.',
      'Evaluasi strategi migrasi database ke Cloud SQL dengan zero-downtime dan backup berkala.'
    ]
  },
  agent_elena: {
    specialization: 'Desain Antarmuka UI/UX, Storytelling Konten, Naskah Presentasi Pitch Deck, Copywriting Bisnis',
    templates: [
      'Rancang konsep struktur antarmuka UI/UX dan design system untuk dashboard virtual office modern.',
      'Buatkan naskah pitch deck 10 slide persuasif untuk presentasi ke dewan direksi dan investor.',
      'Tuliskan copywriting landing page profesional dengan headline yang memikat dan call-to-action kuat.'
    ]
  },
  agent_kenji: {
    specialization: 'Audit Keamanan Zero-Trust, Code Review, Verifikasi Kepatuhan SOP, Analisis Risiko & Grade A+',
    templates: [
      'Lakukan audit keamanan zero-trust komprehensif pada arsitektur aplikasi dan berikan checklist mitigasi celah.',
      'Review standar penanganan data sensitif pengguna dan pastikan sesuai regulasi privasi & enkripsi.',
      'Lakukan stress test logika alur kerja dan berikan skor audit kualitas (Quality Grade Evaluation).'
    ]
  },
  agent_sarah: {
    specialization: 'Akuisisi Pengguna, Analisis Funnel Konversi, SEO, Kampanye Viral Media Sosial, Brand Positioning',
    templates: [
      'Susun strategi kampanye peluncuran viral multi-channel di LinkedIn, X, dan TikTok untuk produk kantor virtual.',
      'Buat audit SEO on-page dan strategi keyword berintensitas tinggi untuk meningkatkan traffic organik 300%.',
      'Rancang funnel konversi dari awareness hingga paid subscription dengan matriks optimasi CAC dan LTV.'
    ]
  },
  agent_marcus: {
    specialization: 'Model Keuangan, Proyeksi Cash Flow, Analisis ROI & Profitabilitas, Valuasi & Perencanaan Budgeting',
    templates: [
      'Buat model simulasi proyeksi cash flow 12 bulan ke depan dengan skenario optimis, realistis, dan pesimis.',
      'Hitung estimasi ROI (Return on Investment) dan payback period untuk adopsi infrastruktur AI di kantor.',
      'Susun rekomendasi alokasi anggaran belanja modal (CapEx) dan biaya operasional (OpEx) kuartal ini.'
    ]
  },
  agent_liam: {
    specialization: 'Penetration Testing, Enkripsi Data Kriptografis, Uptime Server 99.99%, Pipeline CI/CD, Mitigasi Serangan',
    templates: [
      'Lakukan analisis ancaman keamanan infrastruktur cloud (Threat Modeling) dan mitigasi serangan siber.',
      'Rancang arsitektur pipeline CI/CD GitHub Actions otomatis dengan testing otomatis dan containerization.',
      'Audit konfigurasi firewall, enkripsi database, dan kebijakan otorisasi akses zero-trust.'
    ]
  },
  agent_nadia: {
    specialization: 'Product Requirement Document (PRD), User Journey Mapping, Prioritas Backlog, Metrik Pengguna & MVP',
    templates: [
      'Tulis dokumen PRD (Product Requirement Document) lengkap untuk fitur workspace kolaborasi tim AI.',
      'Petakan User Journey Map dari onboarding pengguna baru hingga aktivasi fitur utama (Aha Moment).',
      'Buat kerangka prioritas fitur menggunakan metode RICE (Reach, Impact, Confidence, Effort) untuk rilis MVP.'
    ]
  },
  agent_priya: {
    specialization: 'Drafting Kontrak & Perjanjian Bisnis, Klausul NDA, Kepatuhan Regulasi Privasi Data, Tata Kelola Etika AI',
    templates: [
      'Susun draf template Perjanjian Kerahasiaan (Non-Disclosure Agreement / NDA) berstandar formal bisnis.',
      'Buat checklist audit kepatuhan regulasi privasi data (GDPR dan UU PDP) untuk pemrosesan data AI.',
      'Rancang pedoman etika penggunaan AI (AI Governance Framework) untuk melindungi kerahasiaan data perusahaan.'
    ]
  }
};

export const DirectCommandModal: React.FC<DirectCommandModalProps> = ({
  isOpen,
  onClose,
  agents,
  initialAgent,
  initialPrompt,
  onCommandSuccess
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    initialAgent?.id || agents[0]?.id || 'agent_alex'
  );
  const [prompt, setPrompt] = useState<string>(initialPrompt || '');
  const [taskTitle, setTaskTitle] = useState<string>(
    initialPrompt ? initialPrompt.slice(0, 42) + '...' : ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [resultOutput, setResultOutput] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<string>('');
  const [duration, setDuration] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [agentZoom, setAgentZoom] = useState<number>(1.25);

  useEffect(() => {
    if (initialAgent) {
      setSelectedAgentId(initialAgent.id);
    }
    if (initialPrompt) {
      setPrompt(initialPrompt);
      setTaskTitle(initialPrompt.slice(0, 42) + '...');
    }
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [initialAgent, initialPrompt, isOpen]);

  // Elapsed time counter while loading
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isOpen) return null;

  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const agentDetails = AGENT_TEMPLATES[currentAgent.id] || {
    specialization: currentAgent.role,
    templates: [
      `Buatkan analisis dan laporan mendalam mengenai ${currentAgent.role}`,
      `Berikan rekomendasi praktis sesuai keahlian ${currentAgent.name}`
    ]
  };

  const handleApplyTemplate = (tpl: string) => {
    setPrompt(tpl);
    if (!taskTitle) {
      setTaskTitle(tpl.slice(0, 45) + '...');
    }
  };

  const handleSendCommand = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Harap masukkan instruksi atau pilih salah satu template perintah.');
      return;
    }

    setIsLoading(true);
    // Auto-minimize box to corner so user immediately sees the real 3D virtual office employee!
    setIsMinimized(true);
    setErrorMsg(null);
    setResultOutput(null);
    setResultImageUrl(null);

    // Zoom camera right into agent's workstation in 3D virtual room
    window.dispatchEvent(
      new CustomEvent('office-zoom-to-agent', {
        detail: { agentId: currentAgent.id, mode: 'super' }
      })
    );
    setTimeout(() => {
      const canvasEl = document.querySelector('canvas') || document.getElementById('office-3d-viewport');
      if (canvasEl) {
        canvasEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);

    try {
      const response = await commandSingleAgent({
        agentId: currentAgent.id,
        prompt: prompt.trim(),
        taskTitle: taskTitle.trim() || undefined,
        provider: 'gemini'
      });

      setResultOutput(response.output);
      setResultImageUrl(response.imageUrl || null);
      setProviderUsed(response.providerUsed);
      setDuration(response.metrics.durationSeconds);

      // Automatically POP BACK UP to full modal once answer is received!
      setIsMinimized(false);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      if (onCommandSuccess) {
        onCommandSuccess(currentAgent, prompt.trim(), response.output);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses perintah');
      // If error occurs, pop back up so user sees the error message
      setIsMinimized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultOutput) return;
    navigator.clipboard.writeText(resultOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!resultOutput) return;
    const blob = new Blob([resultOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_${currentAgent.name.replace(/\s+/g, '_')}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setResultOutput(null);
    setErrorMsg(null);
    setPrompt('');
    setTaskTitle('');
  };

  const handleViewDirectlyIn3D = () => {
    window.dispatchEvent(
      new CustomEvent('office-zoom-to-agent', {
        detail: { agentId: currentAgent.id, mode: 'super' }
      })
    );
    setIsMinimized(true);
    setTimeout(() => {
      const canvasEl = document.querySelector('canvas') || document.getElementById('office-3d-viewport');
      if (canvasEl) {
        canvasEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  if (isMinimized) {
    return (
      <aside 
        aria-label="Status Pengerjaan Karyawan Virtual"
        className="fixed bottom-5 right-5 z-50 max-w-sm w-[92vw] sm:w-[400px] rounded-2xl bg-slate-950/90 text-white border border-slate-700/60 shadow-2xl backdrop-blur-2xl p-4 animate-in slide-in-from-bottom-5 fade-in ring-1 ring-white/10 select-none transition-all"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <AgentAvatar3D agent={currentAgent} size="sm" isWorking={isLoading} />
              <span className={`absolute -bottom-0.5 -right-0.5 flex h-3 w-3 rounded-full ${isLoading ? 'bg-blue-400 animate-ping' : 'bg-emerald-400'}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-white truncate">
                  {currentAgent.name}
                </h4>
                {isLoading && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-[10px] font-mono text-blue-300">
                    <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
                    <span>{elapsedSeconds}s</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {isLoading ? 'Sedang mengetik di meja kantor 3D' : 'Laporan selesai dirumuskan!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700/60"
              title="Buka konsol penuh"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Tutup konsol"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Task Snippet */}
        <div className="py-3 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wider">
              Mandat yang Dikerjakan:
            </span>
            <p className="text-slate-200 line-clamp-2 text-xs italic leading-relaxed">
              "{taskTitle || prompt}"
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <div className="flex items-center gap-2 text-emerald-400">
                {/* Animated Typing Bars */}
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ height: '70%' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ height: '100%' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce" style={{ height: '50%' }} />
                </div>
                <span className="text-[11px] font-medium text-slate-300">Mengetik di komputer...</span>
              </div>

              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('office-zoom-to-agent', {
                      detail: { agentId: currentAgent.id, mode: 'super' }
                    })
                  );
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white text-[11px] font-bold border border-blue-500/40 transition-all"
              >
                <span>🔍 Sorot Meja 3D</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Solusi Grade A+ Siap</span>
              </span>

              <button
                onClick={() => setIsMinimized(false)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
              >
                Buka Laporan ↗
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[200px]">
            {currentAgent.apiEngine?.engineName || 'Gemini 3.8 Flash Engine'}
          </span>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 shrink-0"
          >
            <span>Buka Layar Penuh</span>
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Konsol Perintah Karyawan AI
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  API Gemini Gratis
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pilih karyawan sesuai keahliannya, berikan mandat tugas, dan hasilkan laporan instan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-semibold px-2"
              title="Kecilkan ke pojok layar agar bisa melihat kantor 3D"
            >
              <Minimize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Kecilkan ke Pojok</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto bg-white">
          
          {/* Agent Picker Tabs with Individual Colors */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Pilih Karyawan AI yang Ingin Diperintah:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {agents.map((ag) => {
                const isSelected = ag.id === selectedAgentId;
                return (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => {
                      setSelectedAgentId(ag.id);
                      setResultOutput(null);
                      setResultImageUrl(null);
                      setErrorMsg(null);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20 scale-102'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <AgentAvatar3D agent={ag} size="sm" isWorking={ag.status === 'working'} />
                    <span className="text-xs font-extrabold text-slate-900 mt-1 line-clamp-1">
                      {ag.name.split(' ')[0]}
                    </span>
                    <span 
                      className="text-[9px] font-bold line-clamp-1 px-1 rounded bg-slate-100 text-slate-700 mt-0.5 border border-slate-200"
                    >
                      {ag.apiEngine?.icon || '⚡'} {ag.apiEngine?.badge || ag.model}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Agent Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">{currentAgent.name}</span>
                <span className="text-xs text-slate-500 font-semibold">• {currentAgent.role}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Tugas & Spesialisasi:</strong> {agentDetails.specialization}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold">
                <Cpu className="h-3.5 w-3.5 text-blue-600" />
                <span>{currentAgent.apiEngine?.engineName || currentAgent.model}</span>
              </span>
            </div>
          </div>

          {/* Quick Prompt Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Template Perintah Cepat ({currentAgent.name.split(' ')[0]}):
              </span>
              <span className="text-[11px] text-slate-400">Klik untuk menerapkan</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {agentDetails.templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-left px-3 py-2 rounded-lg text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 transition-all font-medium"
                >
                  👉 "{tpl}"
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Perihal / Dokumen (Opsional):
              </label>
              <input
                type="text"
                placeholder="misal: Laporan Analisis Kesiapan AI Agent Korporat..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Isi Perintah / Mandat untuk {currentAgent.name}:
              </label>
              <textarea
                rows={4}
                placeholder={`Instruksikan ${currentAgent.name} apa yang harus dianalisis, diriset, dikoding, atau dirancang...`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 resize-none font-sans leading-relaxed"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Live Working Status if user manually expands modal during loading */}
          {isLoading && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-ping" />
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span>⚡ {currentAgent.name} Sedang Bekerja di Meja Kantor Virtual 3D</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/30 transition-all cursor-pointer"
                  title="Kecilkan box ini ke pojok agar Anda bisa melihat langsung karyawan 3D yang bekerja di ruangan virtual"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>👇 Kecilkan Box & Lihat Karyawan di Ruangan 3D</span>
                </button>
              </div>

              {/* Real-time Thought & Task Info */}
              <div className="space-y-2.5 min-w-0 flex-1 w-full text-left">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AgentAvatar3D agent={currentAgent} size="sm" isWorking={true} />
                    <div>
                      <span className="text-xs font-extrabold text-white block">
                        {currentAgent.name}
                      </span>
                      <span className="text-[10px] text-blue-300">
                        {currentAgent.role}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/60">
                    {currentAgent.apiEngine?.engineName || 'Gemini 3.8 Flash'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Sedang Menganalisis & Mengetik di Komputer Workstation:</span>
                  </p>
                  <p className="italic text-slate-300 text-xs line-clamp-2">
                    "{taskTitle || prompt.slice(0, 110)}..."
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Inferensi aktif • Mengetik draf solusi Grade A+</span>
                  </span>
                  <span className="text-slate-400 font-sans hidden sm:inline">
                    Box akan otomatis pop up penuh saat jawaban selesai!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Result Output Display */}
          {resultOutput && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-extrabold text-emerald-900">
                    Laporan dari {currentAgent.name} Selesai Disusun!
                  </span>
                  {duration && (
                    <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {duration}s
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs transition-all"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh .MD</span>
                  </button>
                </div>
              </div>

              {/* Dreamina Visual Image Preview */}
              {resultImageUrl && (
                <div className="rounded-xl overflow-hidden border border-purple-200 bg-purple-50/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span className="flex items-center gap-1.5">
                      <span>🎨</span>
                      <span>Visual Concept Render • Dreamina AI Creative Studio</span>
                    </span>
                    <a
                      href={resultImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Buka Gambar Penuh ↗
                    </a>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-purple-300 max-h-72 bg-black flex items-center justify-center">
                    <img
                      src={resultImageUrl}
                      alt="Dreamina Visual Artwork"
                      className="w-full h-auto object-cover max-h-72 hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Rendered Markdown Paper */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed max-h-[350px] overflow-y-auto font-sans shadow-inner whitespace-pre-wrap">
                {resultOutput}
              </div>

              {providerUsed && (
                <p className="text-[11px] text-slate-500 font-mono">
                  Diproses melalui: {providerUsed}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Tutup
            </button>
            {resultOutput && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Perintah Baru</span>
              </button>
            )}
          </div>

          <button
            onClick={handleSendCommand}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{currentAgent.name.split(' ')[0]} Sedang Memproses...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Kirim Perintah ke {currentAgent.name.split(' ')[0]}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
