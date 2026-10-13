import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Agent, Task, ActivityLog, TaskPriority } from './types';
import { INITIAL_AGENTS } from './lib/defaultAgents';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  testConnection, 
  subscribeToUserTasks, 
  subscribeToOfficeActivities, 
  saveTaskToFirestore, 
  updateTaskInFirestore, 
  deleteTaskFromFirestore, 
  logActivityToFirestore 
} from './lib/firebase';
import { runMultiAgentTask } from './lib/api';

import { Navbar } from './components/Navbar';
import { Office3DScene } from './components/Office3DScene';
import { OfficeSimulationRoom } from './components/OfficeSimulationRoom';
import { OfficeFloor } from './components/OfficeFloor';
import { AgentAvatar3D } from './components/AgentAvatar3D';
import { LiveTaskRunner } from './components/LiveTaskRunner';
import { TaskCreationModal } from './components/TaskCreationModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { ReportViewer } from './components/ReportViewer';
import { ProviderSettingsModal } from './components/ProviderSettingsModal';
import { DocumentationModal } from './components/DocumentationModal';
import { DirectCommandModal } from './components/DirectCommandModal';
import { FreeApiModal } from './components/FreeApiModal';
import { TaskHistoryList } from './components/TaskHistoryList';
import { OfficeActivityFeed } from './components/OfficeActivityFeed';
import { UnifiedAiSearchHub } from './components/UnifiedAiSearchHub';

// Recommendation Presets for each of the 10 Specialized Agents
const AGENT_RECOMMENDATIONS: Record<string, { label: string; prompt: string; icon: string }> = {
  agent_alex: {
    label: 'Roadmap & Strategi Eksekutif',
    prompt: 'Buatkan roadmap 30 hari peluncuran proyek dan pembagian peran detail 10 divisi kantor virtual.',
    icon: '👔'
  },
  agent_maya: {
    label: 'Riset Pasar & Benchmarking AI',
    prompt: 'Riset tren Autonomous AI Agents tahun 2026 dan benchmarking komparatif model AI global.',
    icon: '🔬'
  },
  agent_david: {
    label: 'Arsitektur Sistem & REST API',
    prompt: 'Rancang arsitektur API microservices dengan Express TypeScript dan skema database PostgreSQL.',
    icon: '💻'
  },
  agent_elena: {
    label: 'Pitch Deck & UI/UX Storytelling',
    prompt: 'Rancang konsep antarmuka UI/UX modern dan susun naskah pitch deck 10 slide persuasif.',
    icon: '🎨'
  },
  agent_kenji: {
    label: 'Audit Keamanan & SOP Zero-Trust',
    prompt: 'Lakukan audit keamanan zero-trust komprehensif, validasi data pengguna dan evaluasi kelayakan Grade A+.',
    icon: '🛡️'
  },
  agent_sarah: {
    label: 'Pertumbuhan Viral & SEO Organik',
    prompt: 'Susun strategi akuisisi pengguna, kampanye viral multi-channel di media sosial dan optimasi funnel konversi.',
    icon: '🚀'
  },
  agent_marcus: {
    label: 'Model Keuangan, ROI & Cashflow',
    prompt: 'Buat model simulasi proyeksi cashflow 12 bulan, analisis ROI belanja teknologi AI dan alokasi anggaran.',
    icon: '💰'
  },
  agent_liam: {
    label: 'Pen-Test, Uptime & CI/CD Pipeline',
    prompt: 'Lakukan penetration testing infrastruktur, rancang pipeline CI/CD GitHub Actions dan audit enkripsi SSL.',
    icon: '⚡'
  },
  agent_nadia: {
    label: 'Dokumen PRD & User Journey MVP',
    prompt: 'Tulis dokumen Product Requirement Document (PRD) lengkap dan petakan user journey Aha-moment fitur kolaborasi.',
    icon: '📝'
  },
  agent_priya: {
    label: 'Draf Kontrak Bisnis & UU PDP',
    prompt: 'Susun draf template Perjanjian Kerahasiaan (NDA) dan checklist audit kepatuhan regulasi privasi data digital.',
    icon: '⚖️'
  }
};

// Initial preloaded tasks so user immediately sees a rich office
const SAMPLE_INITIAL_TASKS: Task[] = [
  {
    id: 'task_sample_01',
    userId: 'demo_user',
    title: 'Analisis Arsitektur AI Agent Berbasis Google Gemini 3.8',
    description: 'Evaluasi kesiapan implementasi model Gemini 3.8 Flash untuk operasional otomatisasi kantor virtual dengan multi-provider fallback.',
    category: 'Engineering & IT',
    priority: 'high',
    status: 'completed',
    provider: 'Gemini (gemini-3.8-flash)',
    assignedAgents: ['agent_alex', 'agent_maya', 'agent_david', 'agent_elena', 'agent_kenji'],
    steps: [
      {
        id: 's1',
        agentId: 'agent_alex',
        agentName: 'Alex Morgan',
        stageName: 'Chief AI Orchestrator',
        status: 'completed',
        summary: 'Penyusunan kerangka dekomposisi sistem',
        details: 'Tugas telah diurai menjadi 4 pilar: riset benchmarking, arsitektur backend Express, narasi eksekutif, dan audit keamanan zero-trust.',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 's2',
        agentId: 'agent_maya',
        agentName: 'Dr. Maya Chen',
        stageName: 'Principal Researcher',
        status: 'completed',
        summary: 'Verifikasi latensi dan batas kuota',
        details: 'Gemini 3.8 Flash menawarkan 15 RPM pada tier gratis dengan kecepatan inferensi token terdepan di industri.',
        timestamp: new Date(Date.now() - 3000000).toISOString()
      },
      {
        id: 's3',
        agentId: 'agent_david',
        agentName: 'David Kim',
        stageName: 'Senior Tech Architect',
        status: 'completed',
        summary: 'Rancang bangun arsitektur fallback aman',
        details: 'Semua API key dilindungi pada sisi server Express dengan skema retry otomatis dan mitigasi HTTP 429.',
        timestamp: new Date(Date.now() - 2400000).toISOString()
      },
      {
        id: 's4',
        agentId: 'agent_elena',
        agentName: 'Elena Rostova',
        stageName: 'Strategic Content Lead',
        status: 'completed',
        summary: 'Redaksi Laporan Operasional Kantor',
        details: 'Dokumen panduan standar operasional telah diformat dalam Markdown terstruktur dengan poin aksi nyata.',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 's5',
        agentId: 'agent_kenji',
        agentName: 'Kenji Sato',
        stageName: 'QA & Compliance Auditor',
        status: 'completed',
        summary: 'Audit Kepatuhan & Grade A+',
        details: 'Sistem memenuhi syarat zero-trust, aturan Firestore terkunci, dan fallback resilient berfungsi 100%. Laporan disetujui (Approved).',
        timestamp: new Date(Date.now() - 1200000).toISOString()
      }
    ],
    finalReport: `# LAPORAN EKSEKUTIF KANTOR VIRTUAL
**Judul:** Analisis Kesiapan & Arsitektur AI Employee Office Berbasis Gemini 3.8
**Disusun Oleh:** Tim Karyawan AI Kantor Virtual
**Status Audit:** Disetujui (Grade A+)

---

### 1. Ringkasan Eksekutif (Executive Summary)
Penerapan sistem kolaborasi multi-agent di lingkungan kantor modern berhasil mendistribusikan beban kerja secara berjenjang. Melalui model utama **Google Gemini 3.8 Flash** yang dipadukan dengan arsitektur multi-provider fallback (Groq & OpenRouter), kantor virtual ini beroperasi dengan tingkat ketahanan tinggi tanpa risiko kebocoran API key ke browser pengguna.

### 2. Temuan Utama (Key Findings)
- **Kecepatan Inferensi:** Waktu pemrosesan rata-rata berkisar 4–8 detik untuk koordinasi 5 agen berurutan.
- **Efisiensi Biaya:** Memanfaatkan Free Tier Gemini AI Studio tanpa memicu billing otomatis.
- **Keamanan Zero-Trust:** Seluruh operasi Firestore divalidasi oleh Security Rules tingkat enterprise, mencegah modifikasi antar pengguna yang tidak sah.

### 3. Matriks Kontribusi Tim Karyawan AI
1. **Alex Morgan (Chief Orchestrator)**: Berhasil melakukan dekomposisi masalah dan delegasi alur kerja berjenjang.
2. **Dr. Maya Chen (Principal Researcher)**: Mengumpulkan data benchmarking dan validasi batas kuota API.
3. **David Kim (Tech Architect)**: Membangun fondasi Express backend dan mitigasi error transien.
4. **Elena Rostova (Strategic Content Lead)**: Menyusun narasi bisnis dan format pelaporan formal.
5. **Kenji Sato (QA Auditor)**: Memverifikasi validitas logika dan memastikan tidak ada celah keamanan.

### 4. Rencana Aksi & Rekomendasi Lanjutan
- Tetapkan tugas-tugas periodik menggunakan template cepat.
- Pantau penggunaan kuota berkala di panel Status Provider.
- Manfaatkan ekspor Markdown untuk integrasi langsung ke arsip perusahaan.`,
    metrics: {
      totalDurationSeconds: 6,
      providerUsed: 'Google Gemini (gemini-3.8-flash)',
      modelUsed: 'gemini-3.8-flash',
      agentsCount: 5
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString()
  }
];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act_1',
    userId: 'demo_user',
    agentId: 'agent_alex',
    agentName: 'Alex Morgan',
    action: 'ready',
    details: 'Siaga di Central Operations Deck untuk menerima mandat baru dari Direktur.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'act_2',
    userId: 'demo_user',
    agentId: 'agent_maya',
    agentName: 'Dr. Maya Chen',
    action: 'research',
    details: 'Menyiapkan modul penelusuran data dan benchmarking analitis.',
    timestamp: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: 'act_3',
    userId: 'demo_user',
    agentId: 'agent_david',
    agentName: 'David Kim',
    action: 'engineering',
    details: 'Memeriksa kestabilan server Express dan koneksi Google Gemini AI.',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

export default function App() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_INITIAL_TASKS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  
  // Active running task banner
  const [activeRunningTask, setActiveRunningTask] = useState<Task | null>(null);
  
  // Modals state
  const [selectedAgentForDetail, setSelectedAgentForDetail] = useState<Agent | null>(null);
  const [selectedTaskForReport, setSelectedTaskForReport] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isDirectCommandModalOpen, setIsDirectCommandModalOpen] = useState(false);
  const [isFreeApiModalOpen, setIsFreeApiModalOpen] = useState(false);
  const [directCommandAgent, setDirectCommandAgent] = useState<Agent | null>(null);
  const [directCommandPrompt, setDirectCommandPrompt] = useState<string>('');
  const [preselectedAgentForTask, setPreselectedAgentForTask] = useState<Agent | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2.5d' | 'cards'>('3d');

  // 1. Connection check on startup as mandated by the Firebase skill
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // 3. Firestore sync for authenticated user
  useEffect(() => {
    if (!user) return;

    // Subscribe to tasks
    const unsubTasks = subscribeToUserTasks(
      user.uid,
      (userTasks) => {
        if (userTasks.length > 0) {
          setTasks(userTasks);
        }
      },
      (err) => console.warn('Could not sync user tasks from Firestore:', err)
    );

    // Subscribe to activities
    const unsubActivities = subscribeToOfficeActivities(
      user.uid,
      (userActivities) => {
        if (userActivities.length > 0) {
          setActivities(userActivities);
        }
      },
      (err) => console.warn('Could not sync activities:', err)
    );

    return () => {
      unsubTasks();
      unsubActivities();
    };
  }, [user]);

  // Auth actions
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      alert('Gagal login: ' + (err.message || 'Jendela popup ditutup atau diblokir'));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Agent Customization
  const handleUpdateAgent = (updated: Agent) => {
    setAgents(agents.map(a => a.id === updated.id ? updated : a));
    setSelectedAgentForDetail(null);
  };

  // Dispatching New Task
  const handleOpenDispatch = (targetAgent?: Agent) => {
    setPreselectedAgentForTask(targetAgent || null);
    setIsNewTaskModalOpen(true);
  };

  const handleSubmitTask = async (data: {
    title: string;
    description: string;
    category: string;
    priority: TaskPriority;
    selectedAgents: Agent[];
    provider: string;
  }) => {
    setIsNewTaskModalOpen(false);

    const taskId = `task_${Date.now()}`;
    const userId = user ? user.uid : 'demo_user';

    // Build initial task state
    const initialSteps = data.selectedAgents.map((ag) => ({
      id: `step_${ag.id}_${Date.now()}`,
      agentId: ag.id,
      agentName: ag.name,
      stageName: ag.role,
      status: 'pending' as const,
      timestamp: new Date().toISOString()
    }));

    const newTask: Task = {
      id: taskId,
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'in_progress',
      provider: data.provider,
      assignedAgents: data.selectedAgents.map(a => a.id),
      steps: initialSteps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update state & set participating agents to working
    setTasks(prev => [newTask, ...prev]);
    setActiveRunningTask(newTask);

    const activeAgentIds = data.selectedAgents.map(a => a.id);
    setAgents(prev => prev.map(a => {
      if (activeAgentIds.includes(a.id)) {
        return {
          ...a,
          status: 'working',
          currentAction: `Sedang memproses "${data.title.slice(0, 35)}..."`
        };
      }
      return a;
    }));

    // Record activity
    const startAct: ActivityLog = {
      id: `act_${Date.now()}`,
      userId,
      agentId: data.selectedAgents[0]?.id || 'agent_alex',
      agentName: data.selectedAgents[0]?.name || 'Alex Morgan',
      action: 'task_started',
      details: `Memulai pengerjaan mandat: "${data.title}" melibatkan ${data.selectedAgents.length} karyawan AI.`,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [startAct, ...prev]);

    if (user) {
      saveTaskToFirestore(newTask).catch(console.warn);
      logActivityToFirestore(startAct).catch(console.warn);
    }

    try {
      // Execute multi-agent workflow through backend Express
      const response = await runMultiAgentTask({
        taskTitle: data.title,
        taskDescription: data.description,
        category: data.category,
        priority: data.priority,
        agents: data.selectedAgents,
        provider: data.provider
      });

      const updatedTask: Task = {
        ...newTask,
        status: 'completed',
        steps: response.steps,
        finalReport: response.finalReport,
        metrics: response.metrics,
        updatedAt: new Date().toISOString()
      };

      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      setActiveRunningTask(updatedTask);

      // Reset agents to idle and increment stats
      setAgents(prev => prev.map(a => {
        if (activeAgentIds.includes(a.id)) {
          return {
            ...a,
            status: 'idle',
            currentAction: 'Siaga menerima perintah berikutnya',
            tasksCompleted: a.tasksCompleted + 1
          };
        }
        return a;
      }));

      // Record completion activity
      const doneAct: ActivityLog = {
        id: `act_${Date.now()}`,
        userId,
        agentId: 'agent_kenji',
        agentName: 'Kenji Sato',
        action: 'task_completed',
        details: `Laporan resmi "${data.title}" telah diverifikasi dan diselesaikan dengan sukses.`,
        timestamp: new Date().toISOString()
      };
      setActivities(prev => [doneAct, ...prev]);

      if (user) {
        updateTaskInFirestore(taskId, updatedTask).catch(console.warn);
        logActivityToFirestore(doneAct).catch(console.warn);
      }
    } catch (err: any) {
      console.error('Task execution error:', err);
      const failedTask: Task = {
        ...newTask,
        status: 'failed',
        updatedAt: new Date().toISOString()
      };

      setTasks(prev => prev.map(t => t.id === taskId ? failedTask : t));
      setActiveRunningTask(failedTask);

      setAgents(prev => prev.map(a => ({
        ...a,
        status: 'idle',
        currentAction: 'Siaga kembali setelah penanganan kendala'
      })));

      alert(`Pemberitahuan pengerjaan tugas: ${err.message || 'Terjadi kesalahan sistem'}`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini dari riwayat?')) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (activeRunningTask?.id === taskId) {
      setActiveRunningTask(null);
    }
    if (user) {
      deleteTaskFromFirestore(taskId).catch(console.warn);
    }
  };

  const handleDirectCommandSuccess = (agent: Agent, prompt: string, output: string) => {
    // 1. Update agent state to working
    setAgents(prev => prev.map(a => a.id === agent.id ? {
      ...a,
      status: 'working',
      currentAction: `Menyelesaikan mandat: "${prompt.slice(0, 32)}..."`,
      tasksCompleted: a.tasksCompleted + 1
    } : a));

    // 2. Create formal task item in task history
    const newTaskId = `cmd_${Date.now()}`;
    const userId = user ? user.uid : 'demo_user';
    const newTask: Task = {
      id: newTaskId,
      userId,
      title: `Perintah ke ${agent.name}: "${prompt.slice(0, 42)}..."`,
      description: prompt,
      category: agent.department,
      priority: 'high',
      status: 'completed',
      provider: 'Google Gemini (gemini-3.8-flash)',
      assignedAgents: [agent.id],
      steps: [
        {
          id: `step_${agent.id}_${Date.now()}`,
          agentId: agent.id,
          agentName: agent.name,
          stageName: agent.role,
          status: 'completed',
          summary: `Selesai memproses instruksi ${agent.role}`,
          details: output,
          timestamp: new Date().toISOString()
        }
      ],
      finalReport: output,
      metrics: {
        totalDurationSeconds: 3,
        providerUsed: 'Google Gemini (gemini-3.8-flash)',
        modelUsed: 'gemini-3.8-flash',
        agentsCount: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    // 3. Log activity
    const act: ActivityLog = {
      id: `act_${Date.now()}`,
      userId,
      agentId: agent.id,
      agentName: agent.name,
      action: 'task_completed',
      details: `Menyelesaikan mandat langsung: "${prompt.slice(0, 50)}..."`,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [act, ...prev]);

    if (user) {
      saveTaskToFirestore(newTask).catch(console.warn);
      logActivityToFirestore(act).catch(console.warn);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenNewTask={() => handleOpenDispatch()}
        onOpenProviders={() => setIsProviderModalOpen(true)}
        onOpenDocs={() => setIsDocsModalOpen(true)}
        onOpenDirectCommand={() => {
          setDirectCommandAgent(null);
          setIsDirectCommandModalOpen(true);
        }}
        onOpenFreeApi={() => setIsFreeApiModalOpen(true)}
        activeTasksCount={tasks.filter(t => t.status === 'in_progress').length}
      />

      {/* Main Container - Full Width Edge to Edge */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Guest / Demo Notice Banner (if not logged in) */}
        {!user && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 shadow-xs">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Mode Eksplorasi Kantor Virtual Aktif
              </p>
              <p className="text-xs text-slate-600">
                Karyawan AI beroperasi aktif di kantor 3D! Masuk dengan Google jika ingin menyinkronkan data permanen ke Cloud Firestore Anda.
              </p>
            </div>
            <button
              onClick={handleLogin}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all shrink-0"
            >
              Masuk dengan Google
            </button>
          </div>
        )}

        {/* Pusat Pencarian Data & Multi-AI Hub (ChatGPT, Gemini, Dreamina, Claude, DeepSeek, Perplexity, etc.) */}
        <UnifiedAiSearchHub
          agents={agents}
          onSelectAgent={(agent) => setSelectedAgentForDetail(agent)}
          onDirectCommand={(agent) => {
            setDirectCommandAgent(agent);
            setIsDirectCommandModalOpen(true);
          }}
        />

        {/* 3D Isometric Dollhouse Virtual Office (Viral View) & Mode Switcher */}
        <section className="space-y-3">
          {/* View Mode Switcher Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Perspektif Kantor:
              </span>
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === '3d'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🏢 3D Gedung Kantor (Viral Dollhouse)</span>
                </button>
                <button
                  onClick={() => setViewMode('2.5d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === '2.5d'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🎮 Simulasi Lantai 2.5D</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>📋 Tampilan Meja & Kartu</span>
                </button>
              </div>
            </div>

            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              {viewMode === '3d' ? 'Three.js 3D Engine • Rotasi 360°' : '2.5D Autonomous Engine'}
            </span>
          </div>

          {/* Render Active View */}
          {viewMode === '3d' && (
            <Office3DScene
              agents={agents}
              activeTask={activeRunningTask}
              onSelectAgent={(agent) => setSelectedAgentForDetail(agent)}
              onDispatchTask={(agent) => handleOpenDispatch(agent)}
              onDirectCommand={(agent) => {
                setDirectCommandAgent(agent);
                setIsDirectCommandModalOpen(true);
              }}
            />
          )}

          {viewMode === '2.5d' && (
            <OfficeSimulationRoom
              agents={agents}
              activeTask={activeRunningTask}
              onSelectAgent={(agent) => setSelectedAgentForDetail(agent)}
              onDispatchTask={(agent) => handleOpenDispatch(agent)}
              onToggleViewMode={() => setViewMode('cards')}
            />
          )}

          {viewMode === 'cards' && (
            <OfficeFloor
              agents={agents}
              onSelectAgent={(agent) => setSelectedAgentForDetail(agent)}
              onDispatchTask={(agent) => handleOpenDispatch(agent)}
              onDirectCommand={(agent) => {
                setDirectCommandAgent(agent);
                setIsDirectCommandModalOpen(true);
              }}
              activeTaskId={activeRunningTask?.id}
              onToggleViewMode={() => setViewMode('3d')}
            />
          )}
        </section>

        {/* Recommendation & Delegation Console for 10 Autonomous Agents */}
        <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs text-sm">
                  ⚡
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Rekomendasi Mandat 10 Karyawan AI Virtual (API Gratis & Siap Perintah)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Setiap agen memiliki spesialisasi unik. Klik perintah di bawah untuk menginstruksikan agen bergerak mencari data di komputernya dan menyusun laporan!
              </p>
            </div>

            <button
              onClick={() => setIsFreeApiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all self-start sm:self-auto shadow-2xs"
            >
              <span>📖</span>
              <span>Dokumentasi REST API</span>
            </button>
          </div>

          {/* 10 Agent Recommendation Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {agents.map((ag) => {
              const rec = AGENT_RECOMMENDATIONS[ag.id] || {
                label: ag.role,
                prompt: `Buat laporan profesional sesuai bidang keahlian ${ag.name}`,
                icon: '💡'
              };

              return (
                <div
                  key={ag.id}
                  className="rounded-xl border border-slate-200 p-3.5 flex flex-col justify-between space-y-2.5 transition-all hover:shadow-md hover:border-slate-300 bg-slate-50/60"
                  style={{ borderTop: `3px solid ${ag.color}` }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AgentAvatar3D agent={ag} size="sm" isWorking={ag.status === 'working'} />
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                            {ag.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {ag.department}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                        <span>{rec.icon}</span>
                        <span>{rec.label}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 text-[10px] leading-relaxed italic">
                        "{rec.prompt}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDirectCommandAgent(ag);
                      setDirectCommandPrompt(rec.prompt);
                      setIsDirectCommandModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition-all hover:scale-[1.02]"
                  >
                    <span>⚡</span>
                    <span>Beri Perintah</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Active Task Inspector / Pipeline Visualizer */}
        {activeRunningTask && (
          <section>
            <LiveTaskRunner
              task={activeRunningTask}
              agents={agents}
              onViewReport={(task) => setSelectedTaskForReport(task)}
              onRetryTask={(task) => handleSubmitTask({
                title: task.title,
                description: task.description,
                category: task.category,
                priority: task.priority,
                selectedAgents: agents.filter(a => task.assignedAgents.includes(a.id)),
                provider: task.provider || 'auto'
              })}
              onClose={() => setActiveRunningTask(null)}
            />
          </section>
        )}

        {/* Task Archives and Live Activity Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TaskHistoryList
              tasks={tasks}
              onSelectTask={(task) => setSelectedTaskForReport(task)}
              onDeleteTask={handleDeleteTask}
            />
          </div>
          <div>
            <OfficeActivityFeed
              activities={activities}
              agents={agents}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600">
            AI Employee Office • Kantor Virtual Multi-Agent Didukung Google AI Studio & Gemini API
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setIsDocsModalOpen(true)} className="hover:text-blue-600 font-medium">
              Dokumentasi
            </button>
            <button onClick={() => setIsProviderModalOpen(true)} className="hover:text-blue-600 font-medium">
              Provider AI
            </button>
            <a 
              href="https://aistudio.google.com" 
              target="_blank" 
              rel="noreferrer" 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Google AI Studio
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isNewTaskModalOpen && (
        <TaskCreationModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          agents={agents}
          onSubmitTask={handleSubmitTask}
          preselectedAgent={preselectedAgentForTask}
        />
      )}

      {selectedAgentForDetail && (
        <AgentDetailModal
          agent={selectedAgentForDetail}
          onClose={() => setSelectedAgentForDetail(null)}
          onUpdateAgent={handleUpdateAgent}
          onAssignTask={(agent) => handleOpenDispatch(agent)}
          onOpenDirectCommand={(agent) => {
            setDirectCommandAgent(agent);
            setIsDirectCommandModalOpen(true);
          }}
        />
      )}

      {selectedTaskForReport && (
        <ReportViewer
          task={selectedTaskForReport}
          onClose={() => setSelectedTaskForReport(null)}
          agents={agents}
        />
      )}

      {isDirectCommandModalOpen && (
        <DirectCommandModal
          isOpen={isDirectCommandModalOpen}
          onClose={() => {
            setIsDirectCommandModalOpen(false);
            setDirectCommandAgent(null);
            setDirectCommandPrompt('');
          }}
          agents={agents}
          initialAgent={directCommandAgent}
          initialPrompt={directCommandPrompt}
          onCommandSuccess={handleDirectCommandSuccess}
        />
      )}

      {isFreeApiModalOpen && (
        <FreeApiModal
          isOpen={isFreeApiModalOpen}
          onClose={() => setIsFreeApiModalOpen(false)}
        />
      )}

      {isProviderModalOpen && (
        <ProviderSettingsModal
          isOpen={isProviderModalOpen}
          onClose={() => setIsProviderModalOpen(false)}
        />
      )}

      {isDocsModalOpen && (
        <DocumentationModal
          isOpen={isDocsModalOpen}
          onClose={() => setIsDocsModalOpen(false)}
        />
      )}
    </div>
  );
}
