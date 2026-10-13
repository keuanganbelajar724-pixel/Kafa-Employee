import React, { useState } from 'react';
import { 
  X, 
  Code, 
  Copy, 
  Check, 
  Play, 
  Cpu, 
  Zap, 
  Terminal, 
  Sparkles,
  BookOpen,
  Send
} from 'lucide-react';

interface FreeApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeApiModal: React.FC<FreeApiModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'tester' | 'snippets'>('endpoints');
  const [testAgentId, setTestAgentId] = useState<string>('agent_maya');
  const [testPrompt, setTestPrompt] = useState<string>('Buat riset tren AI agent 2026 dan rekomendasinya');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const runLiveTest = async () => {
    setIsLoading(true);
    setTestResponse(null);

    try {
      const res = await fetch('/api/command-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: testAgentId,
          prompt: testPrompt,
          taskTitle: 'Uji Coba API Gratis'
        })
      });

      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const curlSnippet = `curl -X POST https://your-domain.app/api/command-agent \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent_david",
    "prompt": "Rancang arsitektur API microservices dengan PostgreSQL",
    "taskTitle": "Arsitektur Sistem"
  }'`;

  const jsSnippet = `const response = await fetch('/api/command-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'agent_maya', // agent_alex, agent_david, agent_elena, agent_kenji
    prompt: 'Riset tren komputasi AI 2026 dan buatkan laporannya'
  })
});
const data = await response.json();
console.log(data.output);`;

  const pySnippet = `import requests

url = "https://your-domain.app/api/command-agent"
payload = {
    "agentId": "agent_alex",
    "prompt": "Buatkan roadmap 30 hari peluncuran produk",
    "taskTitle": "Roadmap Q2"
}

res = requests.post(url, json=payload)
data = res.json()
print("Laporan Agen:", data["output"])`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Dokumentasi & Playground API Gratis
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  REST API Siap Pakai
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Panggil karyawan AI kantor virtual dari aplikasi luar, bot Telegram, webhook, atau script backend Anda secara gratis!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-2 font-bold border-b-2 transition-all ${
              activeTab === 'endpoints'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Daftar Endpoint & Agen
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3 py-2 font-bold border-b-2 transition-all ${
              activeTab === 'tester'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Tester API Interaktif
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-3 py-2 font-bold border-b-2 transition-all ${
              activeTab === 'snippets'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            💻 Kode Contoh (cURL, JS, Python)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          
          {/* TAB 1: ENDPOINTS & DIRECTORY */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-bold">💡 Seputar API Gratis AI Employee Office:</p>
                <p className="text-slate-700 leading-relaxed">
                  Endpoint ini ditenagai langsung oleh <strong>Google Gemini API (gemini-3.8-flash)</strong> yang menyediakan kuota gratis yang sangat luas. Anda tidak perlu membayar langganan untuk memerintah agen atau meminta laporan formal.
                </p>
              </div>

              {/* Endpoint 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-600 text-white">
                    POST
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-900">
                    /api/command-agent
                  </code>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (Perintah Agen Spesifik & Buat Laporan)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Mengirimkan instruksi/prompt khusus ke salah satu dari 5 karyawan AI. Agen akan merespons dalam format Markdown terstruktur profesional.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px]">
                  {`// Request JSON:\n{\n  "agentId": "agent_alex" | "agent_maya" | "agent_david" | "agent_elena" | "agent_kenji",\n  "prompt": "Instruksi Anda...",\n  "taskTitle": "Judul Laporan..."\n}`}
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-600 text-white">
                    POST
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-900">
                    /api/generate-report
                  </code>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (Workflow Multi-Agen & Laporan Lengkap)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Menjalankan kolaborasi tim berjenjang di mana seluruh karyawan mengeksekusi peran mereka, lalu merangkum laporan akhir resmi.
                </p>
              </div>

              {/* Endpoint 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-purple-600 text-white">
                    GET
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-900">
                    /api/agents
                  </code>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (Daftar Karyawan AI & Direktori Keahlian)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Mengembalikan daftar seluruh karyawan AI virtual lengkap dengan ID, jabatan, departemen, dan spesialisasi tugas masing-masing.
                </p>
              </div>

              {/* Daftar ID Agen */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Daftar ID Karyawan AI yang Dapat Dipanggil:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-blue-600">agent_alex</span>: <strong>Alex Morgan</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Strategi, Roadmap, Ringkasan Eksekutif</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-emerald-600">agent_maya</span>: <strong>Dr. Maya Chen</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Riset Pasar, Analisis Data, Benchmarking</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-purple-600">agent_david</span>: <strong>David Kim</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Arsitektur IT, Koding, Database SQL, Cloud</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-pink-600">agent_elena</span>: <strong>Elena Rostova</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Desain UI/UX, Storytelling, Pitch Deck, Copy</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-rose-600">agent_kenji</span>: <strong>Kenji Sato</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Audit Keamanan Zero-Trust, Code Review, QA</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-red-600">agent_sarah</span>: <strong>Sarah Jenkins</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Growth Hacking, Funnel Pemasaran, SEO & Viral</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-teal-600">agent_marcus</span>: <strong>Marcus Vance</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">CFO, Proyeksi Cashflow, Model Keuangan & ROI</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-cyan-600">agent_liam</span>: <strong>Liam O'Connor</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Cybersecurity, Pen-Test, Cloud DevOps & Uptime</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-lime-600">agent_nadia</span>: <strong>Nadia Thorne</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Product Manager, Dokumen PRD, UX Journey & MVP</p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                    <span className="font-mono font-bold text-indigo-600">agent_priya</span>: <strong>Priya Sharma</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Legal Counsel, Kontrak Bisnis, NDA, Kepatuhan UU PDP</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE TESTER */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Uji langsung panggilan endpoint <code>POST /api/command-agent</code> tanpa perlu meninggalkan aplikasi:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Agen Target:
                  </label>
                  <select
                    value={testAgentId}
                    onChange={(e) => setTestAgentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium"
                  >
                    <option value="agent_alex">Alex Morgan (Chief Orchestrator)</option>
                    <option value="agent_maya">Dr. Maya Chen (Principal Researcher)</option>
                    <option value="agent_david">David Kim (Senior Tech Architect)</option>
                    <option value="agent_elena">Elena Rostova (Strategic Content Lead)</option>
                    <option value="agent_kenji">Kenji Sato (QA & Compliance Auditor)</option>
                    <option value="agent_sarah">Sarah Jenkins (Head of Growth & Marketing)</option>
                    <option value="agent_marcus">Marcus Vance (Chief Financial Officer)</option>
                    <option value="agent_liam">Liam O'Connor (Cybersecurity & DevOps)</option>
                    <option value="agent_nadia">Nadia Thorne (Principal Product Manager)</option>
                    <option value="agent_priya">Priya Sharma (Corporate Legal Officer)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Endpoint URL:
                  </label>
                  <input
                    type="text"
                    disabled
                    value="/api/command-agent"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prompt / Instruksi:
                </label>
                <textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <button
                onClick={runLiveTest}
                disabled={isLoading || !testPrompt.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menjalankan Request API...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Jalankan Test API Langsung</span>
                  </>
                )}
              </button>

              {testResponse && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      Response JSON (Status 200 OK):
                    </span>
                    <button
                      onClick={() => copyToClipboard(testResponse, 'json_res')}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      {isCopied === 'json_res' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{isCopied === 'json_res' ? 'Tersalin' : 'Salin JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] max-h-[250px] overflow-y-auto leading-relaxed">
                    {testResponse}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CODE SNIPPETS */}
          {activeTab === 'snippets' && (
            <div className="space-y-5">
              {/* cURL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-blue-600" />
                    cURL (Terminal / Bash):
                  </span>
                  <button
                    onClick={() => copyToClipboard(curlSnippet, 'curl')}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    {isCopied === 'curl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{isCopied === 'curl' ? 'Tersalin' : 'Salin cURL'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {curlSnippet}
                </pre>
              </div>

              {/* JavaScript */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Code className="h-3.5 w-3.5 text-amber-600" />
                    JavaScript / TypeScript (Fetch API):
                  </span>
                  <button
                    onClick={() => copyToClipboard(jsSnippet, 'js')}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700"
                  >
                    {isCopied === 'js' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{isCopied === 'js' ? 'Tersalin' : 'Salin JS'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {jsSnippet}
                </pre>
              </div>

              {/* Python */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                    Python (Requests):
                  </span>
                  <button
                    onClick={() => copyToClipboard(pySnippet, 'py')}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    {isCopied === 'py' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{isCopied === 'py' ? 'Tersalin' : 'Salin Python'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {pySnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-[11px] text-slate-500 font-medium">
            Gratis • Didukung Gemini Flash • Format Laporan Markdown Korporat
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
