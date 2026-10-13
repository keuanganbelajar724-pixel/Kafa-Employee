import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import { AgentAvatar3D } from './AgentAvatar3D';
import { 
  Building2, 
  Sparkles, 
  Coffee, 
  Server, 
  Zap, 
  Volume2, 
  VolumeX,
  Layers,
  ArrowRight,
  Radio
} from 'lucide-react';

interface OfficeFloorProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onDispatchTask: (agent?: Agent) => void;
  onDirectCommand?: (agent: Agent) => void;
  activeTaskId?: string;
  onToggleViewMode?: () => void;
}

const CASUAL_AGENT_THOUGHTS: Record<string, string[]> = {
  agent_alex: [
    'Menganalisis matriks prioritas tugas kantor 📋',
    'Memantau kesiapan delegasi antar karyawan AI ⚡',
    'Menyiapkan kerangka dekomposisi masalah 🚀',
    'Siaga mengoordinasikan tugas eksekutif 🎯'
  ],
  agent_maya: [
    'Meneliti tren adopsi AI di pasar global 🔬',
    'Memverifikasi data statistik & benchmarking 📊',
    'Menyeruput teh hangat sambil membaca jurnal 🍵',
    'Mengumpulkan dataset riset komparatif 🔍'
  ],
  agent_david: [
    'Menguji latensi endpoint backend Express ⚡',
    'Mendengarkan lo-fi beats sambil merancang kode 🎧',
    'Meninjau optimasi query Firestore & zero-trust 💻',
    'Menyusun kerangka arsitektur terdistribusi 🛠️'
  ],
  agent_elena: [
    'Menyusun naskah presentasi & narasi bisnis ✍️',
    'Merapikan format laporan eksekutif resmi 📑',
    'Mempersiapkan materi komunikasi profesional ✨',
    'Mengharmonisasikan tone bahasa dokumen kantor 📝'
  ],
  agent_kenji: [
    'Melakukan audit berkala zero-trust security 🛡️',
    'Memvalidasi kepatuhan aturan Firestore ✅',
    'Memeriksa tidak ada celah logika atau bug 🔍',
    'Meninjau checklist standar kualitas (Grade A+) 📋'
  ],
  agent_sarah: [
    'Menganalisis matriks funnel konversi pemasaran 📈',
    'Menyiapkan kampanye viral di media sosial 🚀',
    'Riset kata kunci SEO berintensitas tinggi 🔍',
    'Mengoptimalkan strategi retensi pengguna baru 💡'
  ],
  agent_marcus: [
    'Memvalidasi proyeksi cash flow dan burn rate 💰',
    'Menghitung estimasi ROI adopsi teknologi AI 📊',
    'Merapikan model keuangan dan neraca anggaran 📑',
    'Simulasi skenario fiskal dan unit economics 💵'
  ],
  agent_liam: [
    'Monitoring log firewall dan proteksi server 🛡️',
    'Simulasi penetration test mitigasi DDoS ⚡',
    'Mengotomasi pipeline build dan continuous delivery 🐳',
    'Verifikasi kunci enkripsi database & SSL 🔐'
  ],
  agent_nadia: [
    'Menyusun dokumen spesifikasi fitur produk (PRD) 📝',
    'Memetakan peta perjalanan pengguna (User Journey) 🗺️',
    'Menilai prioritas backlog dengan metode RICE 🎯',
    'Validasi hipotesis prototype MVP dengan pengguna 💡'
  ],
  agent_priya: [
    'Meninjau klausul kerahasiaan NDA & kontrak kerja sama ⚖️',
    'Memastikan sistem mematuhi regulasi privasi data UU PDP 📜',
    'Menyusun pedoman tata kelola etika kecerdasan buatan 🛡️',
    'Mitigasi risiko hukum operasional korporat 🏛️'
  ]
};

const AGENT_ROOM_INFO: Record<string, { floor: 'L1' | 'L2'; roomName: string; badge: string; color: string }> = {
  // Lantai 2: Tepat 2 Ruangan Aja (Executive Mezzanine)
  agent_alex: { floor: 'L2', roomName: 'Ruang 1: Executive Suite CEO', badge: '🌟 Lantai 2 (Ruang Khusus)', color: '#2563EB' },
  agent_maya: { floor: 'L2', roomName: 'Ruang 2: AI Intelligence & Quantum Lab', badge: '🌟 Lantai 2 (Ruang Khusus)', color: '#10B981' },

  // Lantai 1: Paling Luas (8 Workstations Utama + Halaman & Garasi)
  agent_david: { floor: 'L1', roomName: 'Tech & Engineering Hub', badge: '🏛️ Lantai 1 (Paling Luas)', color: '#8B5CF6' },
  agent_kenji: { floor: 'L1', roomName: 'QA & Compliance Audit', badge: '🏛️ Lantai 1 (Paling Luas)', color: '#DB2777' },
  agent_sarah: { floor: 'L1', roomName: 'Growth & Digital Marketing', badge: '🏛️ Lantai 1 (Paling Luas)', color: '#EF4444' },
  agent_elena: { floor: 'L1', roomName: 'Creative Media & Brand Studio', badge: '🏛️ Lantai 1 (Paling Luas)', color: '#EC4899' },
  agent_liam: { floor: 'L1', roomName: 'Cloud & DevOps Center', badge: '🏛️ Lantai 1 (Paling Luas)', color: '#06B6D4' },
  agent_nadia: { floor: 'L1', roomName: 'Product Strategy Pod', badge: '🏛️ Lantai 1 (Paling Luas)', color: '#84CC16' },
  agent_marcus: { floor: 'L1', roomName: 'Finance & Capital Chambers', badge: '🏛️ Lantai 1 (Paling Luas)', color: '#0D9488' },
  agent_priya: { floor: 'L1', roomName: 'Legal & Governance Chambers', badge: '🏛️ Lantai 1 (Paling Luas)', color: '#6366F1' }
};

export const OfficeFloor: React.FC<OfficeFloorProps> = ({
  agents,
  onSelectAgent,
  onDispatchTask,
  onDirectCommand,
  onToggleViewMode
}) => {
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [dynamicThoughts, setDynamicThoughts] = useState<Record<string, string>>({});
  const [selectedFloor, setSelectedFloor] = useState<'Semua' | 'L1' | 'L2'>('Semua');

  useEffect(() => {
    const interval = setInterval(() => {
      const idleAgents = agents.filter(a => a.status === 'idle');
      if (idleAgents.length > 0) {
        const randomAgent = idleAgents[Math.floor(Math.random() * idleAgents.length)];
        const thoughts = CASUAL_AGENT_THOUGHTS[randomAgent.id] || ['Sedang fokus di meja kerja 💻'];
        const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
        
        setDynamicThoughts(prev => ({
          ...prev,
          [randomAgent.id]: randomThought
        }));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [agents]);

  const toggleAmbientSound = () => {
    if (!ambientAudio) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setAudioCtx(ctx);
        setAmbientAudio(true);
      } catch (e) {
        console.warn('Audio not allowed without gesture', e);
      }
    } else {
      if (audioCtx) {
        audioCtx.close();
        setAudioCtx(null);
      }
      setAmbientAudio(false);
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-white p-4 lg:p-6 border border-slate-200/90 shadow-lg overflow-hidden">
      
      {/* Background Animated Subtle Sweep Line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-radar-sweep pointer-events-none" />
      </div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Lantai Kantor Virtual (3D Office Hub)</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live {agents.length} Karyawan AI Siaga
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Setiap karyawan AI memiliki workstation, animasi interaktif, dan status pengerjaan mandiri secara real-time.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleAmbientSound}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title="Suara Ambien Ruang Kerja"
          >
            {ambientAudio ? <Volume2 className="h-3.5 w-3.5 text-blue-600" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
            <span>Ambien {ambientAudio ? 'ON' : 'OFF'}</span>
          </button>

          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
              title="Beralih ke Simulasi 2.5D Berjalan"
            >
              <Layers className="h-3.5 w-3.5 text-blue-600" />
              <span>🎮 Mode Simulasi 2.5D</span>
            </button>
          )}

          <button
            onClick={() => onDispatchTask()}
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Kirim Tugas ke Kantor</span>
          </button>
        </div>
      </div>

      {/* 3D Isometric Virtual Office Arena (Daylight Clean Theme) */}
      <div className="relative min-h-[460px] lg:min-h-[520px] rounded-xl bg-slate-50/80 border border-slate-200 p-4 lg:p-6 overflow-hidden">
        
        {/* Central Operations Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200 text-xs text-slate-700 shadow-sm">
          <Radio className="h-3.5 w-3.5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-bold text-slate-900">Central Operations Deck</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-600 font-mono text-[11px] font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            Active Sync
          </span>
        </div>

        {/* Coffee Lounge Station */}
        <div className="absolute top-4 left-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
          <Coffee className="h-3.5 w-3.5 text-amber-600" />
          <span>Coffee Corner & Lounge</span>
        </div>

        {/* Server Rack Hub */}
        <div className="absolute top-4 right-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 shadow-2xs">
          <Server className="h-3.5 w-3.5 text-blue-600" />
          <span className="font-mono text-slate-700 font-semibold">Gemini Cloud LPU</span>
        </div>

        {/* Floor Filter Tabs Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 pt-12 pb-1">
          {(['Semua', 'L1', 'L2'] as const).map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFloor === fl
                  ? 'bg-blue-600 text-white shadow-sm scale-105'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {fl === 'Semua' 
                ? '🏢 Semua (10 Karyawan)' 
                : fl === 'L1' 
                ? '🏛️ Lantai 1: Dasar (Paling Luas - 6 Karyawan)' 
                : '🌟 Lantai 2: Mezzanine (Ruang Khusus - 4 Karyawan)'}
            </button>
          ))}
        </div>

        {/* Agent Workstations Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 max-w-6xl mx-auto">
          {agents
            .filter((ag) => selectedFloor === 'Semua' || AGENT_ROOM_INFO[ag.id]?.floor === selectedFloor)
            .map((agent, idx) => {
            const isWorking = agent.status === 'working' || agent.status === 'collaborating';
            const currentBubbleText = dynamicThoughts[agent.id] || agent.currentAction || 'Siaga menerima perintah';
            const roomInfo = AGENT_ROOM_INFO[agent.id];

            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className={`group relative flex flex-col items-center justify-between rounded-2xl p-5 cursor-pointer transition-all duration-300 border ${
                  isWorking
                    ? 'bg-blue-50/70 border-blue-300 shadow-lg scale-[1.02]'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Department Accent Bar */}
                <div 
                  className="absolute top-0 left-6 right-6 h-1.5 rounded-b-full transition-all duration-300"
                  style={{ backgroundColor: agent.color }}
                />

                {/* Room location info header */}
                <div className="w-full flex items-center justify-between gap-1 text-[10px] font-bold text-slate-500 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {roomInfo?.badge || '🏛️ Kantor'}
                  </span>
                  <span className="text-slate-600 truncate font-semibold">
                    {roomInfo?.roomName || 'Workstation'}
                  </span>
                </div>

                {/* Speech Bubble */}
                <div className="w-full mb-2">
                  <div className={`flex items-start gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-300 ${
                    isWorking 
                      ? 'bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs font-medium' 
                      : 'bg-slate-100 text-slate-700 group-hover:text-slate-900 border border-slate-200'
                  }`}>
                    <Zap className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isWorking ? 'text-amber-500 animate-spin' : 'text-blue-600'}`} />
                    <span className="line-clamp-2 italic font-sans font-medium">
                      "{currentBubbleText}"
                    </span>
                  </div>
                </div>

                {/* 3D Character Avatar & Desk View */}
                <div className="my-2 relative flex items-center justify-center">
                  <AgentAvatar3D 
                    agent={agent} 
                    size="desk" 
                    isWorking={isWorking} 
                    agentIndex={idx}
                  />
                </div>

                {/* Agent Identity Info */}
                <div className="w-full text-center mt-2">
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                    {agent.name}
                  </h3>
                  
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {agent.role}
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span 
                      className="px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider"
                      style={{ 
                        backgroundColor: `${agent.color}15`,
                        color: agent.color,
                        border: `1px solid ${agent.color}35`
                      }}
                    >
                      {agent.department}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono font-medium flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">✓</span> {agent.tasksCompleted} Tugas
                    </span>
                  </div>

                  {/* Dedicated AI Engine Badge */}
                  <div className="flex items-center justify-center mt-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 shadow-2xs">
                      <span>{agent.apiEngine?.icon || '⚡'}</span>
                      <span>{agent.apiEngine?.badge || agent.model}</span>
                    </span>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-1 mt-3">
                    {agent.skills.slice(0, 2).map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Quick Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    {onDirectCommand ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDirectCommand(agent);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-300 text-[11px] transition-all hover:scale-105"
                      >
                        <span>⚡</span>
                        <span>Perintah</span>
                      </button>
                    ) : (
                      <span className="font-mono text-[10px] text-slate-400">{agent.model}</span>
                    )}
                    <span className="flex items-center gap-1 text-blue-600 group-hover:translate-x-0.5 transition-transform font-bold text-xs">
                      Profil <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
