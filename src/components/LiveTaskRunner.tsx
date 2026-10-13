import React, { useEffect, useState, useMemo } from 'react';
import { Task, Agent, TaskStep } from '../types';
import { AgentAvatar3D } from './AgentAvatar3D';
import { AgentRoomScene } from './AgentRoomScene';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Clock, 
  Cpu, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Terminal,
  Activity,
  Compass,
  Code,
  X,
  Laptop
} from 'lucide-react';

interface LiveTaskRunnerProps {
  task: Task;
  agents: Agent[];
  onViewReport: (task: Task) => void;
  onRetryTask?: (task: Task) => void;
  onClose?: () => void;
}

// Live Simulated Thought Stages for Active Multi-Agent Tasks
const WORKING_THOUGHT_STREAMS = [
  '🧠 Mengurai instruksi & memetakan konteks mandat proyek...',
  '🌐 Mengakses basis data, benchmarking & referensi model AI 2026...',
  '💻 Memformulasikan arsitektur logika dan solusi komprehensif...',
  '✍️ Mengetik draf dokumen rekomendasi dan rancangan teknis...',
  '🛡️ Memvalidasi kepatuhan kualitas, akurasi data & verifikasi Grade A+...',
  '🚀 Finalisasi laporan resmi dan sinkronisasi ke seluruh divisi kantor...'
];

// Sample Live Code/Draft Preview per Agent
const AGENT_LIVE_SNIPPETS: Record<string, string> = {
  agent_alex: `// Chief AI Orchestrator - Executive Roadmap
const roadmap2026 = {
  phase: "Enterprise Autonomy",
  departments: 10,
  zeroTrustStatus: "VERIFIED_A_PLUS",
  targetDelivery: "Immediate"
};`,
  agent_maya: `// Dr. Maya Chen - AI Research & Benchmark
const benchmark = {
  model: "Gemini 3.8 Flash",
  rpmRate: 15,
  throughput: "High-speed reasoning",
  accuracyScore: 0.994
};`,
  agent_david: `// David Kim - Senior Tech Architect
export async function handleTaskPipeline(req: Request) {
  const schema = await initPostgresSchema();
  return sanitizeStream(schema.query());
}`,
  agent_elena: `/* Elena Rostova - UI/UX & Storytelling */
.office-hero-experience {
  theme: "Home-Style Cozy Virtual Office";
  elevation: "Full 3D & 2.5D Mezzanine";
  typography: "Display Sans & Tech Mono";
}`,
  agent_kenji: `// Kenji Sato - QA & Compliance Audit
function verifyZeroTrustRules() {
  assert(firestoreRules.isLocked === true);
  return { compliance: "Grade A+", approved: true };
}`,
  agent_sarah: `// Sarah Jenkins - Growth & Viral Funnel
const growthCampaign = {
  channels: ["LinkedIn", "X", "TikTok"],
  viralCoefficient: 2.7,
  organicReachTarget: "100k+"
};`,
  agent_marcus: `// Marcus Vance - Financial Model & ROI
const financialSim = {
  projectedROI: "340%",
  breakevenMonths: 3.5,
  operationalSavingsUsd: 14200
};`,
  agent_liam: `// Liam O'Connor - Cybersecurity & Cloud
name: CI/CD Zero-Trust Pipeline
on: [push]
jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps: [checkout, pen-test]`,
  agent_nadia: `// Nadia Thorne - Product PRD & UX
# PRD: REAL-TIME AUTONOMOUS WORKPLACE
- Problem Statement: Fragmented team communication
- Solution: 10 Specialized AI Coworkers`,
  agent_priya: `// Priya Sharma - Legal & Governance
CLAUSE 4.2: PRIVACY & DATA CONFIDENTIALITY
All user telemetry is encrypted and protected
under UU PDP 2022 and international GDPR.`
};

export const LiveTaskRunner: React.FC<LiveTaskRunnerProps> = ({
  task,
  agents,
  onViewReport,
  onRetryTask,
  onClose
}) => {
  const isCompleted = task.status === 'completed';
  const isFailed = task.status === 'failed';
  const isInProgress = task.status === 'in_progress';

  // Selected agent step to spotlight & zoom
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Zoom scale for agent portrait (1 = 100%, 1.4 = 140%, 2 = 200%, 2.5 = 250%)
  const [zoomScale, setZoomScale] = useState<number>(1.35);

  // Fullscreen interactive zoom inspector modal
  const [isFullscreenZoomModal, setIsFullscreenZoomModal] = useState<boolean>(false);
  const [modalZoomScale, setModalZoomScale] = useState<number>(2.0);

  // Live thinking ticker index for realistic working feel
  const [thoughtIndex, setThoughtIndex] = useState<number>(0);
  const [liveTypingLength, setLiveTypingLength] = useState<number>(20);

  // Confetti on complete
  useEffect(() => {
    if (isCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe confetti fallback
      }
    }
  }, [isCompleted]);

  // Rotate thought ticker during in_progress
  useEffect(() => {
    if (!isInProgress) return;
    const interval = setInterval(() => {
      setThoughtIndex(prev => (prev + 1) % WORKING_THOUGHT_STREAMS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isInProgress]);

  // Simulate typewriter stream in code preview during in_progress
  useEffect(() => {
    if (!isInProgress) return;
    const interval = setInterval(() => {
      setLiveTypingLength(prev => (prev > 160 ? 30 : prev + 12));
    }, 450);
    return () => clearInterval(interval);
  }, [isInProgress]);

  // Automatically select the active running step, or first step
  const activeStep: TaskStep = useMemo(() => {
    if (selectedStepId) {
      const found = task.steps.find(s => s.id === selectedStepId);
      if (found) return found;
    }
    const running = task.steps.find(s => s.status === 'running');
    if (running) return running;
    return task.steps[0] || {
      id: 'default',
      agentId: 'agent_alex',
      agentName: 'Alex Morgan',
      stageName: 'Chief AI Orchestrator',
      status: 'pending',
      timestamp: new Date().toISOString()
    };
  }, [task.steps, selectedStepId]);

  // Resolved Agent object
  const focusedAgent: Agent = useMemo(() => {
    const ag = agents.find(a => a.id === activeStep.agentId);
    if (ag) return ag;
    return {
      id: activeStep.agentId,
      name: activeStep.agentName,
      role: activeStep.stageName,
      avatar3d: 'lead',
      color: '#3B82F6',
      department: 'Leadership'
    } as Agent;
  }, [agents, activeStep]);

  // Trigger 3D Office Camera to zoom directly to this agent's desk
  const handleZoom3DCameraToAgent = () => {
    try {
      window.dispatchEvent(
        new CustomEvent('office-zoom-to-agent', {
          detail: { agentId: focusedAgent.id, mode: 'super' }
        })
      );
      // Smoothly scroll towards the 3D scene canvas
      const canvasEl = document.querySelector('canvas') || document.getElementById('office-3d-viewport');
      if (canvasEl) {
        canvasEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      console.warn('Could not dispatch 3D zoom event:', e);
    }
  };

  const currentSnippet = AGENT_LIVE_SNIPPETS[focusedAgent.id] || AGENT_LIVE_SNIPPETS.agent_alex;

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200/90 shadow-xl p-5 lg:p-7 mb-8 overflow-hidden relative">
      
      {/* Top Banner Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className={`flex h-3 w-3 rounded-full ${
              isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-blue-500 animate-ping'
            }`} />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {task.title}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {task.category}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              isInProgress ? 'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse' :
              isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {isInProgress ? '⚡ SEDANG DIPROSES' : isCompleted ? '✅ SELESAI' : '❌ KENDALA'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {task.description}
          </p>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center gap-2.5">
          {task.metrics?.providerUsed && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 font-bold">
              <Cpu className="h-3.5 w-3.5 text-blue-600" />
              <span>{task.metrics.providerUsed}</span>
            </div>
          )}

          {isCompleted && (
            <button
              onClick={() => onViewReport(task)}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <FileText className="h-4 w-4" />
              <span>Buka Laporan Lengkap</span>
            </button>
          )}

          {isFailed && onRetryTask && (
            <button
              onClick={() => onRetryTask(task)}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Coba Lagi</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              type="button"
              className="text-xs text-slate-400 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 font-semibold transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* ⭐ HERO SECTION: LIVE AGENT WORK & ZOOM SPOTLIGHT ⭐ */}
      {/* ======================================================== */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-5 lg:p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient Background Aura based on Agent Color */}
        <div 
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: focusedAgent.color }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Sorotan & Zoom Karyawan AI yang Sedang Bekerja</span>
            </h4>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              Live Inspector
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoom3DCameraToAgent}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
              title="Arahkan kamera 3D gedung dan zoom dekat ke meja kerja agen ini"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>🎥 Zoom Kamera 3D ke Meja Agen</span>
            </button>

            <button
              onClick={() => setIsFullscreenZoomModal(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-105"
              title="Perbesar avatar karyawan AI dalam modal layar penuh interaktif"
            >
              <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>🔍 Perbesar Layar Penuh</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Left = Zoomable Agent Studio | Right = Real-Time Work Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* LEFT: ZOOMABLE AGENT VIEWPORT (COL 5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
            
            {/* Top Zoom Controls Bar */}
            <div className="w-full flex items-center justify-between gap-2 mb-3 px-2 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <span>🔍 Zoom Agen:</span>
                <span className="font-mono text-emerald-400 font-extrabold">{Math.round(zoomScale * 100)}%</span>
              </span>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomScale(prev => Math.max(0.8, prev - 0.2))}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Perkecil Gambar"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => setZoomScale(1.0)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    zoomScale === 1.0 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  title="100% Normal"
                >
                  1x
                </button>

                <button
                  onClick={() => setZoomScale(1.4)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    zoomScale === 1.4 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  title="140% Dekat"
                >
                  1.4x
                </button>

                <button
                  onClick={() => setZoomScale(1.9)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    zoomScale === 1.9 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  title="190% Super Zoom"
                >
                  1.9x
                </button>

                <button
                  onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.2))}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Perbesar Gambar"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Viewport for Scaled Agent Virtual Office Room */}
            <div 
              className="w-full cursor-pointer hover:opacity-95 transition-all"
              onClick={() => setIsFullscreenZoomModal(true)}
              title="Klik untuk membuka Zoom Layar Penuh"
            >
              <AgentRoomScene 
                agent={focusedAgent} 
                zoomScale={zoomScale} 
                isWorking={isInProgress || activeStep.status === 'running'} 
                onViewIn3D={handleZoom3DCameraToAgent}
                show3DButton={true}
              />
            </div>

            {/* Agent Identity Footer */}
            <div className="w-full mt-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: focusedAgent.color }} 
                />
                <span className="text-xs font-extrabold text-white">
                  {focusedAgent.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  • {focusedAgent.department}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                Meja Kerja Lantai {focusedAgent.id === 'agent_alex' || focusedAgent.id === 'agent_maya' ? '2 (Mezzanine)' : '1 (Utama)'}
              </span>
            </div>
          </div>

          {/* RIGHT: TRANSPARENT WORK MONITOR ("APA YANG SEDANG DIKERJAKAN") (COL 7) */}
          <div className="lg:col-span-7 flex flex-col space-y-3.5">
            
            {/* Header Stage Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  Tahap Mandat Saat Ini:
                </span>
                <h5 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>{activeStep.stageName}</span>
                  <span className="text-xs text-slate-400 font-normal">({activeStep.agentName})</span>
                </h5>
              </div>

              <div className="flex items-center gap-2">
                {focusedAgent.apiEngine && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1.5">
                    <span>{focusedAgent.apiEngine.icon}</span>
                    <span>{focusedAgent.apiEngine.engineName}</span>
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  activeStep.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  activeStep.status === 'running' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {activeStep.status === 'completed' ? 'Sudah Selesai' :
                   activeStep.status === 'running' ? 'Sedang Berjalan' : 'Antrean Mandat'}
                </span>
              </div>
            </div>

            {/* Explanation of What the Agent is Doing */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                <span>Rincian yang Sedang Dikerjakan:</span>
              </span>
              <p className="text-slate-200 leading-relaxed text-xs">
                {activeStep.details || (
                  isInProgress
                    ? `${focusedAgent.name} sedang memproses bagian "${activeStep.stageName}" untuk tugas "${task.title}". Berkoordinasi dengan modul AI guna menghasilkan formulasi data, analisis mendalam, serta validasi eksekutif.`
                    : `${focusedAgent.name} siap melaksanakan tahapan kerja ini saat instruksi dipicu.`
                )}
              </p>
            </div>

            {/* Live Thought Stream Ticker (Shows AI thinking step-by-step) */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping shrink-0" />
                <span className="text-blue-200 font-medium truncate">
                  {isInProgress 
                    ? WORKING_THOUGHT_STREAMS[thoughtIndex]
                    : `Selesai: Seluruh parameter kerja ${focusedAgent.name} telah terverifikasi Grade A+.`}
                </span>
              </div>
              <span className="text-[10px] font-mono text-blue-300/80 shrink-0">
                {isInProgress ? 'Inferensi Aktif' : 'Status: Siaga'}
              </span>
            </div>

            {/* Live Terminal / Code & Draft Typing Simulation */}
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/90 font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3 w-3 text-emerald-400" />
                  <span>Keluaran Teks Langsung • {focusedAgent.role}</span>
                </span>
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  <span>{isInProgress ? 'Live Streaming' : 'Tersimpan'}</span>
                </span>
              </div>
              <pre className="p-3 text-[11px] text-emerald-300/90 leading-relaxed overflow-x-auto select-all max-h-28 overflow-y-auto">
                <code>
                  {isInProgress 
                    ? currentSnippet.slice(0, liveTypingLength) + (liveTypingLength < currentSnippet.length ? '█' : '')
                    : currentSnippet}
                </code>
              </pre>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 🧩 MULTI-AGENT STEPS PIPELINE (CLICKABLE TO ZOOM ANY AGENT) */}
      {/* ======================================================== */}
      <div className="mt-7 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Alur Kolaborasi Antar Karyawan AI ({task.steps.length} Tahap):</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            💡 Klik salah satu kartu karyawan di bawah untuk menyorot & ngezoom tampilannya
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {task.steps.map((step, idx) => {
            const agent = agents.find(a => a.id === step.agentId) || {
              id: step.agentId,
              name: step.agentName,
              role: step.stageName,
              avatar3d: 'lead',
              color: '#3B82F6',
              department: 'Leadership'
            } as Agent;

            const isDone = step.status === 'completed';
            const isCurrent = step.status === 'running';
            const isSelected = activeStep.id === step.id;

            return (
              <div
                key={step.id || idx}
                onClick={() => setSelectedStepId(step.id)}
                className={`relative rounded-xl p-3.5 border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-400/40 shadow-lg shadow-blue-500/15 scale-[1.02]'
                    : isCurrent 
                    ? 'bg-amber-50/80 border-amber-400 shadow-md shadow-amber-500/10'
                    : isDone
                    ? 'bg-slate-50/90 border-slate-200 hover:bg-slate-100/90'
                    : 'bg-slate-50/40 border-slate-200/60 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <AgentAvatar3D agent={agent} size="sm" isWorking={isCurrent || isSelected} agentIndex={idx} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {step.agentName}
                      </p>
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <Clock className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Antrean</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold truncate">
                      {step.stageName}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 italic">
                      {step.details ? step.details.slice(0, 95) + '...' : 'Menunggu giliran pengerjaan...'}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="absolute bottom-1 right-2 text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                    🔍 Sedang Disorot
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Report Card when completed */}
      {isCompleted && task.finalReport && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-200/60">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Laporan Resmi Berhasil Diselesaikan & Diverifikasi (Grade A+)</span>
            </div>
            <button
              onClick={() => onViewReport(task)}
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
            >
              Buka Laporan Selengkapnya <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
            {task.finalReport.slice(0, 300)}...
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🔍 MODAL ZOOM INSPECTOR LAYAR PENUH (300% DETAIL) */}
      {/* ======================================================== */}
      {isFullscreenZoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span 
                  className="h-4 w-4 rounded-full" 
                  style={{ backgroundColor: focusedAgent.color }} 
                />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{focusedAgent.name}</span>
                    <span className="text-xs text-slate-400 font-normal">({focusedAgent.role})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Inspeksi Visual Detail Karakter The Sims • {focusedAgent.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFullscreenZoomModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Zoom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 my-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Skala Zoom:</span>
                <span className="font-mono text-emerald-400 font-extrabold text-sm">
                  {Math.round(modalZoomScale * 100)}%
                </span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalZoomScale(prev => Math.max(1.0, prev - 0.25))}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Perkecil"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                <input
                  type="range"
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  value={modalZoomScale}
                  onChange={(e) => setModalZoomScale(Number(e.target.value))}
                  className="w-32 accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <button
                  onClick={() => setModalZoomScale(prev => Math.min(3.0, prev + 0.25))}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Perbesar"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setModalZoomScale(2.0)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Reset 2x
                </button>
              </div>
            </div>

            {/* Huge Zoom Canvas in Actual Office Room */}
            <div className="w-full rounded-2xl overflow-hidden border border-slate-800 relative">
              <AgentRoomScene 
                agent={focusedAgent} 
                zoomScale={modalZoomScale} 
                isWorking={true} 
                onViewIn3D={() => {
                  setIsFullscreenZoomModal(false);
                  handleZoom3DCameraToAgent();
                }}
                show3DButton={false}
              />
            </div>

            {/* Modal Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <p>
                Aksesoris khusus: {focusedAgent.bio.slice(0, 80)}...
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsFullscreenZoomModal(false);
                    handleZoom3DCameraToAgent();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all"
                >
                  🎥 Zoom Kamera 3D ke Meja Agen
                </button>
                <button
                  onClick={() => setIsFullscreenZoomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
