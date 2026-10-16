import React, { useState } from 'react';
import { Agent, TaskPriority } from '../types';
import { AgentAvatar3D } from './AgentAvatar3D';
import { 
  X, 
  Sparkles, 
  Send, 
  Cpu, 
  Tag, 
  CheckSquare, 
  Square,
  Wand2
} from 'lucide-react';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onSubmitTask: (data: {
    title: string;
    description: string;
    category: string;
    priority: TaskPriority;
    selectedAgents: Agent[];
    provider: string;
  }) => void;
  preselectedAgent?: Agent | null;
}

const TEMPLATES = [
  {
    title: 'Strategi & Roadmap Peluncuran Produk AI 2026',
    category: 'Strategi & Bisnis',
    priority: 'high' as TaskPriority,
    description: 'Analisis peluang adopsi AI di pasar B2B enterprise. Buat evaluasi kompetitor, arsitektur teknis MVP, strategi pemasaran konten, dan audit mitigasi risiko kegagalan implementasi.'
  },
  {
    title: 'Audit Keamanan & Kepatuhan Zero-Trust Cloud Architecture',
    category: 'Engineering & QA',
    priority: 'urgent' as TaskPriority,
    description: 'Lakukan audit komprehensif terhadap arsitektur backend, validasi Firebase Security Rules, isolasi data PII, dan rekomendasi perlindungan denial-of-wallet untuk aplikasi berskala besar.'
  },
  {
    title: 'Riset Tren Pasar & Benchmark AI Agent Workplace',
    category: 'Riset Mendalam',
    priority: 'medium' as TaskPriority,
    description: 'Kumpulkan data perkembangan AI agents di lingkungan kantor modern. Bandingkan efisiensi waktu, model penetapan harga token API, dan dampak kolaborasi multi-agent terhadap produktivitas tim.'
  }
];

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  agents,
  onSubmitTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Strategi & Bisnis');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [provider, setProvider] = useState('auto');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(
    agents.map(a => a.id)
  );

  if (!isOpen) return null;

  const toggleAgent = (id: string) => {
    if (selectedAgentIds.includes(id)) {
      if (selectedAgentIds.length === 1) return;
      setSelectedAgentIds(selectedAgentIds.filter(item => item !== id));
    } else {
      setSelectedAgentIds([...selectedAgentIds, id]);
    }
  };

  const selectAllAgents = () => {
    setSelectedAgentIds(agents.map(a => a.id));
  };

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setCategory(tpl.category);
    setPriority(tpl.priority);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const chosenAgents = agents.filter(a => selectedAgentIds.includes(a.id));
    onSubmitTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      selectedAgents: chosenAgents,
      provider
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto sm:my-8 max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 border border-blue-200 shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 truncate">Delegasi Tugas Multi-Agent Baru</h2>
              <p className="text-[11px] text-slate-500 font-medium hidden xs:block truncate">
                Pekerjakan tim agen AI untuk menganalisis, menyusun kode/strategi, dan merilis laporan resmi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Templates Bar */}
        <div className="p-3 sm:p-4 bg-blue-50/40 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700">
            <Wand2 className="h-3.5 w-3.5 text-blue-600" />
            <span>Pilih Template Cepat Siap Pakai:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium transition-all text-left shadow-2xs"
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Judul Tugas / Mandat Kantor *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Analisis Kesiapan Transformasi AI & Rencana Implementasi"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Instruksi Terperinci & Batasan *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan latar belakang, target capaian, format keluaran yang diinginkan, serta poin kritis yang harus diteliti..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Category, Priority & Provider Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-500" /> Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Strategi & Bisnis">Strategi & Bisnis</option>
                <option value="Engineering & IT">Engineering & IT</option>
                <option value="Riset Mendalam">Riset Mendalam</option>
                <option value="Konten & Komunikasi">Konten & Komunikasi</option>
                <option value="Audit & Kepatuhan">Audit & Kepatuhan</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="low">Rendah (Low)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="high">Tinggi (High)</option>
                <option value="urgent">Mendesak (Urgent)</option>
              </select>
            </div>

            {/* AI Provider */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-blue-600" /> AI Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="auto">Auto (Gemini 3.8 Flash + Fallback)</option>
                <option value="gemini">Google Gemini AI Studio (Utama)</option>
                <option value="groq">Groq Cloud (Llama 3.3 70B)</option>
                <option value="openrouter">OpenRouter (Free Hub)</option>
              </select>
            </div>
          </div>

          {/* Agent Selection Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Karyawan AI Yang Dilibatkan ({selectedAgentIds.length}/{agents.length})
              </label>
              <button
                type="button"
                onClick={selectAllAgents}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                Pilih Semua Karyawan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {agents.map((agent) => {
                const isChecked = selectedAgentIds.includes(agent.id);
                return (
                  <div
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-blue-600">
                      {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-400" />}
                    </div>
                    <AgentAvatar3D agent={agent} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                        {agent.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-medium">
                        {agent.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Mulai Eksekusi Multi-Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
