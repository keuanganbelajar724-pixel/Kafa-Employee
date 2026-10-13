import React, { useState } from 'react';
import { Agent } from '../types';
import { searchOfficeData, SearchDataResponse, SearchDataResult } from '../lib/api';
import { AgentAvatar3D } from './AgentAvatar3D';
import { AgentRoomScene } from './AgentRoomScene';
import { 
  Search, 
  Sparkles, 
  Zap, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Bot,
  ChevronDown,
  X,
  Volume2,
  FileText,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface UnifiedAiSearchHubProps {
  agents: Agent[];
  onSelectAgent?: (agent: Agent) => void;
  onDirectCommand?: (agent: Agent) => void;
  onOpenTaskModalWithData?: (title: string, content: string) => void;
}

const QUICK_SEARCH_CHIPS = [
  { label: 'Riset Tren AI 2026', engine: 'Gemini Pro', agentId: 'agent_maya', icon: '🔬' },
  { label: 'Konsep Visual Desain Kantor Modern', engine: 'Dreamina AI', agentId: 'agent_elena', icon: '🎨' },
  { label: 'Roadmap & Strategi Operasional', engine: 'ChatGPT-4o', agentId: 'agent_alex', icon: '🤖' },
  { label: 'Arsitektur API & Database SQL', engine: 'Claude 3.5', agentId: 'agent_david', icon: '💻' },
  { label: 'Tren Viral & Keyword SEO', engine: 'Perplexity', agentId: 'agent_sarah', icon: '📈' },
  { label: 'Simulasi ROI & Valuasi Bisnis', engine: 'FinGPT', agentId: 'agent_marcus', icon: '💰' }
];

export const UnifiedAiSearchHub: React.FC<UnifiedAiSearchHubProps> = ({
  agents,
  onSelectAgent,
  onOpenTaskModalWithData
}) => {
  const [query, setQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchDataResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchAvatarZoom, setSearchAvatarZoom] = useState<number>(1.25);

  const handleSearch = async (queryText?: string, targetId?: string) => {
    const q = (queryText || query).trim();
    if (!q) return;

    const t = targetId !== undefined ? targetId : selectedTarget;

    setIsLoading(true);
    setErrorMsg(null);
    setIsExpanded(true);

    try {
      const res = await searchOfficeData({
        query: q,
        targetAgentId: t
      });
      setSearchResponse(res);
      if (res.results && res.results.length > 0) {
        setActiveTab(res.results[0].agentId);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencari data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (text: string, title: string) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_${title.replace(/\s+/g, '_')}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
    utterance.lang = 'id-ID';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const activeAgentObj = agents.find(a => a.id === selectedTarget);

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 shadow-md p-4 sm:p-5 transition-all">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Pusat Pencarian Data & Multi-AI Hub
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                10 Mesin AI Khusus
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Cukup cari data di sini — ChatGPT, Gemini, Dreamina AI, Claude, dan lainnya siap mengumpulkan data untuk Anda.
            </p>
          </div>
        </div>

        {/* Engine selector dropdown pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-[11px] font-bold text-slate-500 hidden sm:inline">
            Tujuan API:
          </label>
          <div className="relative">
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">🌐 Cari Semua AI Sekaligus (Multi-Search)</option>
              <option disabled>────────── Pilihan Agen & API ──────────</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.apiEngine?.icon || '🤖'} {ag.name} ({ag.apiEngine?.badge || ag.role})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative flex items-center gap-2"
      >
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selectedTarget === 'all'
                ? "Ketik topik data yang ingin dicari (misal: 'tren AI 2026', 'analisis pasar', 'desain visual')..."
                : `Tanya atau cari data melalui ${activeAgentObj?.name} (${activeAgentObj?.apiEngine?.badge})...`
            }
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Mencari...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Cari Data</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        <span className="text-[10px] font-bold text-slate-500 mr-1 flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-500" /> Contoh Kueri:
        </span>
        {QUICK_SEARCH_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(chip.label);
              setSelectedTarget(chip.agentId);
              handleSearch(chip.label, chip.agentId);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
            <span className="text-[9px] text-slate-400 font-mono">({chip.engine})</span>
          </button>
        ))}
      </div>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* Loading State with Zoomable Searching Agent Card */}
      {isLoading && (() => {
        const searchingAgent = activeAgentObj || agents[1] || agents[0];
        return (
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-3.5 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-ping" />
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                  <span>Karyawan AI Sedang Menjelajah & Mengompilasi Data...</span>
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
                <span className="text-[10px] text-slate-400 font-bold">🔍 Zoom:</span>
                <button
                  type="button"
                  onClick={() => setSearchAvatarZoom(prev => Math.max(0.8, prev - 0.2))}
                  className="p-1 rounded hover:bg-slate-700 text-slate-300"
                  title="Perkecil"
                >
                  <ZoomOut className="h-3 w-3" />
                </button>
                <span className="font-mono text-emerald-400 text-[11px] font-extrabold px-1">
                  {Math.round(searchAvatarZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setSearchAvatarZoom(prev => Math.min(2.4, prev + 0.2))}
                  className="p-1 rounded hover:bg-slate-700 text-slate-300"
                  title="Perbesar"
                >
                  <ZoomIn className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Directly in the Agent's Virtual Office Room */}
            <AgentRoomScene
              agent={searchingAgent}
              zoomScale={searchAvatarZoom}
              isWorking={true}
              onViewIn3D={() => {
                window.dispatchEvent(
                  new CustomEvent('office-zoom-to-agent', {
                    detail: { agentId: searchingAgent.id }
                  })
                );
                const canvasEl = document.querySelector('canvas') || document.getElementById('office-3d-viewport');
                if (canvasEl) {
                  canvasEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              show3DButton={true}
            />

              <div className="space-y-1.5 min-w-0 flex-1 w-full text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">
                    {searchingAgent.name}
                  </span>
                  <span className="text-[10px] text-blue-300 font-mono">
                    ({searchingAgent.role})
                  </span>
                  {searchingAgent.apiEngine && (
                    <span className="text-[9px] bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-200 border border-blue-700/60 font-mono">
                      {searchingAgent.apiEngine.engineName}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed italic bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  "Menelusuri direktori pengetahuan, data riset, dan analisis komparatif untuk kueri: <strong>'{query}'</strong>..."
                </p>

                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Sintesis data multi-agent sedang berlangsung • Menyusun laporan terpadu</span>
                </div>
              </div>
            </div>
        );
      })()}

      {/* Results Section */}
      {searchResponse && !isLoading && (
        <div className="mt-4 border-t border-slate-200 pt-4 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Hasil Pencarian Data untuk:
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-xs font-extrabold border border-blue-200">
                "{searchResponse.query}"
              </span>
              <span className="text-[11px] text-slate-500">
                ({searchResponse.durationSeconds} detik)
              </span>
            </div>

            <button
              onClick={() => setSearchResponse(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Tutup Hasil ✕
            </button>
          </div>

          {/* Case 1: Single Mode Result */}
          {searchResponse.mode === 'single' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{searchResponse.agent?.apiEngine?.icon || '🤖'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {searchResponse.agent?.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        {searchResponse.agent?.apiEngine?.badge || searchResponse.engineBadge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {searchResponse.agent?.role} • {searchResponse.providerUsed}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSpeak(searchResponse.output || '')}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs"
                    title={isSpeaking ? 'Hentikan Audio' : 'Bacakan Data'}
                  >
                    <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? 'text-blue-600 animate-pulse' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleCopy(searchResponse.output || '', 'single')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    {copiedId === 'single' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedId === 'single' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(searchResponse.output || '', searchResponse.query)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Dreamina Visual Image Preview if available */}
              {searchResponse.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-purple-200 bg-purple-50/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-purple-600" />
                      Visual Rendering Dreamina AI Creative Studio
                    </span>
                    <a
                      href={searchResponse.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Buka Resolusi Penuh <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-purple-300 max-h-72 bg-black flex items-center justify-center">
                    <img
                      src={searchResponse.imageUrl}
                      alt="Dreamina Visual Concept"
                      className="w-full h-auto object-cover max-h-72 hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 max-h-80 overflow-y-auto">
                {searchResponse.output}
              </div>
            </div>
          )}

          {/* Case 2: Multi-AI Mode Results (Comparison Grid & Tabs) */}
          {searchResponse.mode === 'multi' && searchResponse.results && (
            <div className="space-y-3">
              
              {/* Tab Selector across the 4 AI engines */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-blue-600" /> Bandingkan Mesin:
                </span>
                {searchResponse.results.map((res) => {
                  const isSel = activeTab === res.agentId;
                  return (
                    <button
                      key={res.agentId}
                      onClick={() => setActiveTab(res.agentId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSel
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{res.apiEngine?.icon || '🤖'}</span>
                      <span>{res.agentName}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${isSel ? 'bg-white/20' : 'bg-slate-100'}`}>
                        {res.apiEngine?.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content Card */}
              {(() => {
                const currentResult = searchResponse.results.find(r => r.agentId === activeTab) || searchResponse.results[0];
                if (!currentResult) return null;

                return (
                  <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{currentResult.apiEngine?.icon || '🤖'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                              {currentResult.agentName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                              {currentResult.apiEngine?.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {currentResult.role} • {currentResult.apiEngine?.provider}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeak(currentResult.output)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs"
                          title={isSpeaking ? 'Hentikan Audio' : 'Bacakan Data'}
                        >
                          <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? 'text-blue-600 animate-pulse' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleCopy(currentResult.output, currentResult.agentId)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          {copiedId === currentResult.agentId ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedId === currentResult.agentId ? 'Tersalin' : 'Salin'}</span>
                        </button>
                        <button
                          onClick={() => handleDownload(currentResult.output, `${currentResult.agentName}_${searchResponse.query}`)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                    {/* Dreamina Visual Image Preview if available */}
                    {currentResult.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-purple-200 bg-purple-50/50 p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="h-4 w-4 text-purple-600" />
                            Visual Concept Render by Dreamina AI
                          </span>
                          <a
                            href={currentResult.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 font-semibold"
                          >
                            Buka Gambar Penuh <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="relative rounded-lg overflow-hidden border border-purple-300 max-h-72 bg-black flex items-center justify-center">
                          <img
                            src={currentResult.imageUrl}
                            alt="Dreamina Visual Concept"
                            className="w-full h-auto object-cover max-h-72 hover:scale-102 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    {/* Markdown Body */}
                    <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 max-h-80 overflow-y-auto">
                      {currentResult.output}
                    </div>
                  </div>
                );
              })()}

              {/* Comparative summary snippet of all 4 engines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                {searchResponse.results.map((res) => (
                  <div
                    key={res.agentId}
                    onClick={() => setActiveTab(res.agentId)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      activeTab === res.agentId
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <span>{res.apiEngine?.icon || '🤖'}</span>
                      <span className="truncate">{res.agentName}</span>
                    </div>
                    <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                      {res.apiEngine?.badge}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {res.output.replace(/#|\*|\[|\]/g, '').slice(0, 80)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
