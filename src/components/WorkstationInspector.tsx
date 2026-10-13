import React, { useState, useEffect, useMemo } from 'react';
import { Agent, Task } from '../types';
import { AgentAvatar3D } from './AgentAvatar3D';
import { 
  Laptop, 
  Terminal, 
  Code2, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Coffee, 
  Maximize2, 
  Minimize2, 
  X, 
  ZoomIn, 
  Volume2, 
  VolumeX, 
  Activity, 
  Layers, 
  Eye, 
  Play, 
  RotateCcw,
  Zap,
  Clock,
  Compass,
  FileText
} from 'lucide-react';

interface WorkstationInspectorProps {
  agent: Agent;
  activeTask?: Task | null;
  zoomLevel: 'super' | 'desk' | 'room';
  onSetZoomLevel: (level: 'super' | 'desk' | 'room') => void;
  onClose: () => void;
  onDirectCommand?: (agent: Agent) => void;
  onRecallToDesk?: (agentId: string) => void;
  onSendCoffee?: (agentId: string) => void;
  onDispatchTask?: (agent: Agent) => void;
}

export const WorkstationInspector: React.FC<WorkstationInspectorProps> = ({
  agent,
  activeTask,
  zoomLevel,
  onSetZoomLevel,
  onClose,
  onDirectCommand,
  onRecallToDesk,
  onSendCoffee,
  onDispatchTask
}) => {
  const [activeTab, setActiveTab] = useState<'screen' | 'activity' | 'specs'>('screen');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [simulatedTypingTick, setSimulatedTypingTick] = useState<number>(0);

  // Audio typing synthesizer using Web Audio API
  const playKeyboardClick = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 260, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // Audio not supported or blocked by browser policy
    }
  };

  // Typing animation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTypingTick(prev => (prev + 1) % 100);
      if (Math.random() > 0.4) {
        playKeyboardClick();
      }
    }, 450);
    return () => clearInterval(timer);
  }, [soundEnabled]);

  // Is this agent actively working on the current active task?
  const isAgentInActiveTask = useMemo(() => {
    if (!activeTask || activeTask.status !== 'in_progress') return false;
    const runningStep = activeTask.steps.find(s => s.status === 'running');
    return runningStep?.agentId === agent.id || activeTask.assignedAgents.includes(agent.id);
  }, [activeTask, agent.id]);

  const activeTaskStep = useMemo(() => {
    if (!activeTask || activeTask.status !== 'in_progress') return null;
    return activeTask.steps.find(s => s.agentId === agent.id);
  }, [activeTask, agent.id]);

  // Screen content templates based on agent persona and role
  const workstationData = useMemo(() => {
    switch (agent.id) {
      case 'agent_alex':
        return {
          windowTitle: 'Alex Morgan • Executive Orchestrator Deck (ChatGPT-4o)',
          screenApp: 'Enterprise Task Orchestrator & AI Delegation Matrix',
          statusText: 'Mengorkestrasi dekomposisi instruksi dan memantau pipeline multi-agent',
          codeSnippet: [
            '// EXECUTIVE WORKFLOW ORCHESTRATION',
            'const workflow = new MultiAgentPipeline({',
            '  orchestrator: "Alex Morgan (ChatGPT-4o)",',
            '  status: "ACTIVE_DELEGATION",',
            '  activeThreads: 10,',
            '  slaResponseMs: 140',
            '});',
            '',
            'await workflow.decomposeMandate({',
            '  priority: "HIGH",',
            '  assignedNodes: ["Dr. Maya Chen", "David Kim", "Elena Rostova"],',
            '  consensusThreshold: 0.98',
            '});',
            '// Status: Pipeline sinkronisasi data 100% OK'
          ],
          liveLogs: [
            '[14:42:01] Mandat eksekutif dianalisis & dipecah jadi 4 subtugas',
            '[14:41:40] Delegasi tugas teknis diteruskan ke David Kim',
            '[14:41:15] Review arsitektur dengan Dr. Maya Chen selesai',
            '[14:40:50] Menyeruput kopi espresso di meja kerja'
          ],
          metricWpm: 128,
          metricCpu: '68%',
          metricCoffee: 'Espresso (80% penuh)'
        };

      case 'agent_maya':
        return {
          windowTitle: 'Dr. Maya Chen • Deep Research Lab (Gemini 2.5 Pro)',
          screenApp: 'Neural Fact Verification & Scientific Search Console',
          statusText: 'Meneliti literatur ilmiah, data pasar, dan verifikasi fakta dengan Google Gemini AI',
          codeSnippet: [
            '# GOOGLE GEMINI DEEP RESEARCH HARVESTER',
            'import gemini_research as ai',
            '',
            'query = "Enterprise AI Multi-Agent Architecture Benchmarking"',
            'citations = ai.deep_web_search(query, verify_facts=True)',
            '',
            'for source in citations.filter(peer_reviewed=True):',
            '    confidence = source.calculate_reliability()',
            '    print(f"Verified: {source.title} | Conf: {confidence:.2%}")',
            '',
            '# Synthesizing structured executive matrix...'
          ],
          liveLogs: [
            '[14:42:05] Query 18 database ilmiah dan repositori teknis...',
            '[14:41:42] 12 data points tervalidasi dengan confidence 99.4%',
            '[14:41:18] Menyusun tabel komparasi benchmarking pasar',
            '[14:40:55] Merangkum insight riset untuk laporan direksi'
          ],
          metricWpm: 114,
          metricCpu: '84%',
          metricCoffee: 'Teh Hijau Matcha (hangat)'
        };

      case 'agent_david':
        return {
          windowTitle: 'David Kim • Senior Backend Architect (Claude 3.5 Sonnet)',
          screenApp: 'VS Code Cloud • TypeScript & FastAPI Microservices',
          statusText: 'Menulis arsitektur backend, optimasi query, dan integrasi Express / Gemini API',
          codeSnippet: [
            '// CLOUD BACKEND SERVICE WORKER',
            'import { GoogleGenAI } from "@google/genai";',
            'import { Router } from "express";',
            '',
            'export const apiRouter = Router();',
            'apiRouter.post("/api/synthesize", async (req, res) => {',
            '  const { prompt, agentConfig } = req.body;',
            '  const gemini = new GoogleGenAI();',
            '  const response = await gemini.models.generateContent({',
            '    model: "gemini-2.5-flash",',
            '    contents: prompt',
            '  });',
            '  return res.json({ status: "success", data: response.text });',
            '});'
          ],
          liveLogs: [
            '[14:42:08] Build completed in 118ms (0 warnings)',
            '[14:41:50] Unit tests passed: 42/42 (100% coverage)',
            '[14:41:22] Endpoint /api/synthesize latency: 38ms',
            '[14:40:58] Mengetik kode integrasi backend'
          ],
          metricWpm: 132,
          metricCpu: '74%',
          metricCoffee: 'Americano Dingin (tersisa 60%)'
        };

      case 'agent_elena':
        return {
          windowTitle: 'Elena Rostova • UI/UX Design Studio (Dreamina AI)',
          screenApp: 'Figma Vector Canvas & Responsive Layout Mockup',
          statusText: 'Merancang layout UI, sistem desain warna modern, dan prototipe interaktif',
          codeSnippet: [
            '/* DESIGN TOKENS & FIGMA CANVAS SYNC */',
            ':root {',
            '  --primary-accent: #3B82F6;',
            '  --surface-ground: #0F172A;',
            '  --glass-blur: blur(16px);',
            '  --shadow-elevation: 0 20px 25px -5px rgb(0 0 0 / 0.1);',
            '}',
            '',
            '/* Generating high-fidelity visual cards for virtual office */',
            '.agent-card:hover { transform: scale(1.05); }'
          ],
          liveLogs: [
            '[14:42:02] Exporting SVG assets and vector components...',
            '[14:41:40] Color contrast accessibility ratio: 8.4:1 (AAA Pass)',
            '[14:41:12] Menyelesaikan visual mockup dashboard The Sims',
            '[14:40:48] Menguji responsivitas layout mobile & desktop'
          ],
          metricWpm: 98,
          metricCpu: '62%',
          metricCoffee: 'Latte Art Vanilla'
        };

      case 'agent_kenji':
        return {
          windowTitle: 'Kenji Sato • Lead QA & CyberSec (DeepSeek R1)',
          screenApp: 'Security Pentest Terminal & Automated Test Suite',
          statusText: 'Memeriksa celah keamanan, validasi input sanitasi, dan regression test runner',
          codeSnippet: [
            '#!/bin/bash',
            '# AUTOMATED SECURITY AUDIT & PENTEST',
            'echo "[*] Scanning API endpoints for injection vulnerabilities..."',
            'npm audit --audit-level=high',
            'jest --coverage --runInBand --testTimeout=10000',
            '',
            'echo "[PASS] 0 critical vulnerabilities found"',
            'echo "[PASS] All OAuth & Firebase auth rules validated"'
          ],
          liveLogs: [
            '[14:42:06] Security scan: zero vulnerabilities found',
            '[14:41:45] Regression test: 58 passed, 0 failed',
            '[14:41:20] Memeriksa firestore.rules dan input validation',
            '[14:40:52] Menyiapkan laporan sertifikasi keamanan'
          ],
          metricWpm: 120,
          metricCpu: '70%',
          metricCoffee: 'Espresso Double Shot'
        };

      case 'agent_sarah':
        return {
          windowTitle: 'Sarah Jenkins • Growth & Marketing (ChatGPT-4o)',
          screenApp: 'Content Copywriting Engine & SEO Traffic Matrix',
          statusText: 'Menulis konten artikel viral, optimasi kata kunci SEO, dan strategi distribusi',
          codeSnippet: [
            '# STRATEGI MARKETING & KONTEN VIRAL',
            'Headline: "10 Karyawan AI Virtual yang Siap Mengubah Bisnis Anda"',
            '',
            'Target Audience: Pendiri Startup, Eksekutif, Tim Tech',
            'Value Proposition: Otomasi tugas 24/7 tanpa kompromi kualitas',
            'SEO Score: 96/100 (Keyword density optimal: 2.4%)',
            'Predicted CTR: +38.5% YoY'
          ],
          liveLogs: [
            '[14:42:04] Draf artikel pengumuman produk selesai',
            '[14:41:48] Analisis tren Google Trends & engagement media',
            '[14:41:16] Merancang 3 variasi headline untuk A/B testing',
            '[14:40:54] Menyeruput kopi sambil memeriksa analitik'
          ],
          metricWpm: 110,
          metricCpu: '58%',
          metricCoffee: 'Cappuccino Hangat'
        };

      case 'agent_liam':
        return {
          windowTitle: 'Liam O\'Connor • DevOps & Cloud Infra (Perplexity AI)',
          screenApp: 'Kubernetes Pod Manager & Server Telemetry Console',
          statusText: 'Memantau server load, kestabilan koneksi Express, dan container Docker',
          codeSnippet: [
            '# KUBERNETES DEPLOYMENT MANIFEST',
            'apiVersion: apps/v1',
            'kind: Deployment',
            'metadata:',
            '  name: ai-virtual-office-engine',
            'spec:',
            '  replicas: 4',
            '  containers:',
            '  - name: express-vite-server',
            '    image: node:20-alpine',
            '    ports:',
            '    - containerPort: 3000'
          ],
          liveLogs: [
            '[14:42:07] Pod health: 4/4 pods running normal',
            '[14:41:43] Cloud latency: 28ms to nearest edge node',
            '[14:41:19] Port 3000 development server live & responsive',
            '[14:40:51] Memeriksa konsumsi memori container'
          ],
          metricWpm: 125,
          metricCpu: '65%',
          metricCoffee: 'Cold Brew Hitam'
        };

      case 'agent_nadia':
        return {
          windowTitle: 'Nadia Thorne • Product Strategy (Notion AI)',
          screenApp: 'Product Roadmap & User Story Backlog Matrix',
          statusText: 'Menyusun prioritas fitur, alur pengguna (UX flow), dan sprint roadmap',
          codeSnippet: [
            '## SPRINT 14 ROADMAP & FEATURE BACKLOG',
            '- [x] Fitur 1: Kamera Zoom Makro Meja Kerja (Super Zoom 4.5x)',
            '- [x] Fitur 2: Layar Monitor Kerja Real-Time Karyawan',
            '- [ ] Fitur 3: Ekspor Laporan Otomatis ke Dokumen PDF',
            '- [ ] Fitur 4: Telemetri Produktivitas Mingguan Tim',
            '',
            'Dampak Pengguna: Kepuasan meningkat +45%'
          ],
          liveLogs: [
            '[14:42:03] Menyusun spesifikasi teknis untuk fitur baru',
            '[14:41:41] Sinkronisasi backlog sprint dengan tim engineering',
            '[14:41:14] Evaluasi feedback dari pengujian pengguna',
            '[14:40:53] Membuka draf PRD di Notion AI'
          ],
          metricWpm: 105,
          metricCpu: '55%',
          metricCoffee: 'Teh Chamomile Madu'
        };

      case 'agent_marcus':
        return {
          windowTitle: 'Marcus Vance • Chief Financial Analyst (FinGPT)',
          screenApp: 'Financial Modeling & Enterprise Cashflow Terminal',
          statusText: 'Menganalisis efisiensi biaya API, proyeksi pendapatan, dan margin ROI',
          codeSnippet: [
            '# FINANCIAL PROJECTION & RUNWAY MODEL',
            'def calculate_roi(api_cost_per_month, time_saved_hours):',
            '    hourly_value = 45.0  # USD per hour saved',
            '    monthly_benefit = time_saved_hours * hourly_value',
            '    net_savings = monthly_benefit - api_cost_per_month',
            '    return (net_savings / api_cost_per_month) * 100',
            '',
            '# Projected ROI: +312% with automated AI office'
          ],
          liveLogs: [
            '[14:42:05] Audit pengeluaran kuota gratis API vs efisiensi',
            '[14:41:44] Proyeksi penghematan waktu operasional 85 jam/bulan',
            '[14:41:17] Menyusun spreadsheet cashflow kuartal depan',
            '[14:40:50] Verifikasi margin keuntungan proyek'
          ],
          metricWpm: 112,
          metricCpu: '60%',
          metricCoffee: 'Black Coffee Espresso'
        };

      case 'agent_priya':
        return {
          windowTitle: 'Priya Sharma • Compliance & Legal Counsel (Harvey AI)',
          screenApp: 'Legal Contract Auditor & Regulatory Clause Scanner',
          statusText: 'Memeriksa klausul hukum, regulasi privasi data, dan kepatuhan NDA',
          codeSnippet: [
            '## LEGAL COMPLIANCE & PRIVACY CLAUSES',
            'CLAUSE 4.2: Data Ownership & Confidentiality',
            'All proprietary data processed via AI employee workstations',
            'shall remain the sole property of the Enterprise Client.',
            '',
            'STATUS: COMPLIANT WITH GDPR, SOC-2 TYPE II, AND ISO-27001.',
            'Risk Score: 0.00 / 10.00 (Zero Liability Detected)'
          ],
          liveLogs: [
            '[14:42:06] Audit 18 klausul kontrak kerjasama selesai',
            '[14:41:46] Verifikasi kepatuhan privasi data pengguna',
            '[14:41:21] Memeriksa perlindungan hak cipta konten AI',
            '[14:40:56] Menyiapkan ringkasan legal untuk direksi'
          ],
          metricWpm: 108,
          metricCpu: '54%',
          metricCoffee: 'Teh Melati Hangat'
        };

      default:
        return {
          windowTitle: `${agent.name} • Virtual Workstation`,
          screenApp: 'Autonomous AI Workstation Console',
          statusText: 'Bekerja aktif menyelesaikan mandat kerja',
          codeSnippet: [
            '// GENERAL AGENT WORKSTATION STREAM',
            `Agent: "${agent.name}", Role: "${agent.role}"`,
            'Status: ACTIVE_PROCESSING',
            'Timestamp: ' + new Date().toLocaleTimeString()
          ],
          liveLogs: [
            '[14:42:00] Memproses instruksi kerja',
            '[14:41:30] Mengetik di keyboard komputer workstation'
          ],
          metricWpm: 110,
          metricCpu: '60%',
          metricCoffee: 'Kopi Hangat'
        };
    }
  }, [agent]);

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[540px] lg:w-[620px] z-30 pointer-events-auto select-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="rounded-2xl bg-slate-900/95 text-white border border-blue-500/40 shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <AgentAvatar3D agent={agent} size="sm" isWorking={true} />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {agent.name}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-400/30">
                  {agent.department}
                </span>
                {agent.apiEngine && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/90 text-amber-300 border border-slate-600 flex items-center gap-1">
                    <span>{agent.apiEngine.icon}</span>
                    <span>{agent.apiEngine.badge}</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {agent.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Audio Click Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                soundEnabled 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
              }`}
              title={soundEnabled ? 'Matikan efek suara ketikan keyboard' : 'Nyalakan efek suara ketikan keyboard'}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>

            {/* Minimize / Maximize Content */}
            <button
              onClick={() => setIsMinimized(prev => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
              title={isMinimized ? 'Perluas tampilan monitor kerja' : 'Kecilkan tampilan monitor kerja'}
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </button>

            {/* Close Inspector */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Tutup pantauan meja kerja"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized Quick Pill View */}
        {isMinimized ? (
          <div className="p-3 flex items-center justify-between text-xs bg-slate-900/80">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] text-slate-300 font-medium">
                Sedang aktif bekerja di komputer ({workstationData.metricWpm} WPM)
              </span>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline"
            >
              Buka Layar Penuh
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            
            {/* Camera Zoom Level Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-bold px-1">
                <ZoomIn className="h-3.5 w-3.5 text-blue-400" />
                <span>Kamera Meja:</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSetZoomLevel('super')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                    zoomLevel === 'super'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  title="Super Zoom Makro: Kamera menatap layar komputer dan wajah karyawan langsung"
                >
                  <span>🔍 Makro Layar (4.5x)</span>
                </button>

                <button
                  onClick={() => onSetZoomLevel('desk')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                    zoomLevel === 'desk'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  title="Zoom Meja Kerja: Melihat seluruh meja, kursi, dan monitor"
                >
                  <span>🪑 Meja Kerja (2.5x)</span>
                </button>

                <button
                  onClick={() => onSetZoomLevel('room')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                    zoomLevel === 'room'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  title="Zoom Ruangan: Melihat seluruh ruangan departemen"
                >
                  <span>🏢 Ruangan (1x)</span>
                </button>
              </div>
            </div>

            {/* Active Task Banner if running */}
            {isAgentInActiveTask && activeTask && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-400/50 flex items-start gap-2.5 animate-pulse">
                <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-left text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <span>TUGAS SEDANG AKTIF:</span>
                    <span className="text-white truncate max-w-xs">{activeTask.title}</span>
                  </div>
                  {activeTaskStep && (
                    <p className="text-[11px] text-blue-200 mt-0.5">
                      Tahapan: <span className="font-semibold text-white">{activeTaskStep.stageName}</span> • Status: Sedang diproses AI
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-700 pb-1.5 text-xs">
              <button
                onClick={() => setActiveTab('screen')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'screen'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>🖥️ Layar Monitor Virtual</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'activity'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>📝 Sedang Ngapain?</span>
              </button>

              <button
                onClick={() => setActiveTab('specs')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'specs'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>⚙️ Spesifikasi & Status</span>
              </button>
            </div>

            {/* TAB 1: SCREEN VIEW (Virtual Monitor) */}
            {activeTab === 'screen' && (
              <div className="space-y-2">
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 shadow-inner">
                  {/* Virtual Monitor Window Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500/80 inline-block" />
                      <span className="h-2 w-2 rounded-full bg-amber-500/80 inline-block" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="font-mono text-slate-400 ml-1 truncate max-w-xs">
                        {workstationData.windowTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[9px] text-emerald-400">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>LIVE STREAM</span>
                      </span>
                      <span className="text-slate-500">|</span>
                      <span>{workstationData.metricWpm} WPM</span>
                    </div>
                  </div>

                  {/* Simulated Code / Work Stream Content */}
                  <div className="font-mono text-[11px] leading-relaxed text-slate-300 max-h-48 overflow-y-auto space-y-0.5 p-1 select-text">
                    {workstationData.codeSnippet.map((line, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-slate-600 select-none text-[10px] w-5 text-right">{idx + 1}</span>
                        <span className={
                          line.startsWith('//') || line.startsWith('#') || line.startsWith('/*')
                            ? 'text-slate-500 italic'
                            : line.includes('const') || line.includes('import') || line.includes('def')
                            ? 'text-purple-400'
                            : line.includes('return') || line.includes('await')
                            ? 'text-pink-400'
                            : line.includes('"') || line.includes("'")
                            ? 'text-emerald-300'
                            : 'text-slate-200'
                        }>
                          {line}
                        </span>
                      </div>
                    ))}
                    {/* Blinking Cursor */}
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="text-slate-600 select-none text-[10px] w-5 text-right">&gt;</span>
                      <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />
                      <span className="text-[10px] text-slate-500">Mengetik otomatis sesuai spesialisasi...</span>
                    </div>
                  </div>
                </div>

                {/* Status Ticker Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Terminal className="h-3 w-3 text-emerald-400" />
                    <span className="truncate max-w-xs">{workstationData.statusText}</span>
                  </span>
                  <span className="text-amber-400 font-bold shrink-0">
                    ⚡ CPU: {workstationData.metricCpu}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVITY TIMELINE ("Sedang Ngapain?") */}
            {activeTab === 'activity' && (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <h4 className="text-[11px] font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    <span>Aktivitas Real-Time di Kantor Virtual:</span>
                  </h4>
                  <div className="space-y-1.5 text-[11px]">
                    {workstationData.liveLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <span className="font-mono text-slate-300">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] space-y-1 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status Meja Kerja:</span>
                    <span className="font-bold text-emerald-400">Aktif & Siap Menerima Mandat</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Minuman di Meja:</span>
                    <span className="font-medium text-amber-200">{workstationData.metricCoffee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kecepatan Output:</span>
                    <span className="font-mono font-bold text-blue-300">{workstationData.metricWpm} Kata / Menit</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HARDWARE & AI SPECS */}
            {activeTab === 'specs' && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Mesin AI Utama</span>
                    <span className="font-bold text-white text-xs">{agent.model}</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Kuotasi Gratis Aktif</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Beban Komputasi</span>
                    <span className="font-bold text-amber-400 text-xs">{workstationData.metricCpu} Normal</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Suhu: 42°C Optimal</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] space-y-1.5">
                  <span className="text-xs font-bold text-white block">Keahlian Khusus:</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Direct Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                {onDirectCommand && (
                  <button
                    onClick={() => onDirectCommand(agent)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                    title={`Kirim perintah instruksi langsung ke ${agent.name}`}
                  >
                    <Send className="h-3 w-3" />
                    <span>Beri Perintah</span>
                  </button>
                )}

                {onDispatchTask && (
                  <button
                    onClick={() => onDispatchTask(agent)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                    title="Tugaskan pekerjaan baru ke agen ini"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Tugaskan Pekerjaan</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {onRecallToDesk && (
                  <button
                    onClick={() => onRecallToDesk(agent.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                    title="Minta karyawan kembali duduk di meja kerjanya jika sedang berjalan"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Kembali ke Meja</span>
                  </button>
                )}

                {onSendCoffee && (
                  <button
                    onClick={() => onSendCoffee(agent.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-amber-600/80 hover:bg-amber-600 text-white transition-all"
                    title="Kirim agen istirahat kopi sejenak ke pantry"
                  >
                    <Coffee className="h-3 w-3" />
                    <span>Kopi Pantry</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
