import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Copy, 
  Check 
} from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 border border-blue-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Panduan Lengkap AI Employee Office</h2>
              <p className="text-xs text-slate-500 font-medium">
                Instalasi, konfigurasi Firebase, setup API key, deployment, dan pengujian sistem.
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

        {/* Content Body */}
        <div className="p-6 space-y-8 overflow-y-auto flex-1 text-sm text-slate-700 leading-relaxed bg-white">
          
          {/* Section 1: Overview & Arsitektur */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold">1</span>
              <span>Gambaran Umum & Arsitektur Sistem</span>
            </h3>
            <p className="font-medium text-slate-600">
              <strong className="text-slate-900">AI Employee Office</strong> adalah platform kantor virtual berbasis web di mana pengguna bertindak sebagai Direktur Kantor yang mendelegasikan tugas ke tim karyawan AI khusus:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-600 font-medium">
              <li><strong className="text-slate-900">Alex Morgan (Chief Orchestrator)</strong>: Menganalisis mandat, memecah tugas (task decomposition), dan memandu alur kerja.</li>
              <li><strong className="text-slate-900">Dr. Maya Chen (Principal Researcher)</strong>: Riset mendalam, pencarian fakta, benchmarking, dan validasi data.</li>
              <li><strong className="text-slate-900">David Kim (Senior Tech Architect)</strong>: Spesifikasi arsitektur teknis, struktur sistem, dan rekomendasi implementasi.</li>
              <li><strong className="text-slate-900">Elena Rostova (Strategic Content Lead)</strong>: Sintesis narasi profesional, naskah bisnis, dan dokumentasi eksekutif.</li>
              <li><strong className="text-slate-900">Kenji Sato (QA & Compliance Auditor)</strong>: Audit logika, mitigasi risiko, grading mutu, dan verifikasi akhir.</li>
            </ul>
          </section>

          {/* Section 2: Instalasi Lokal */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold">2</span>
              <span>Petunjuk Instalasi Lokal (Local Setup)</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Pastikan Anda memiliki <strong className="text-slate-900">Node.js v20+</strong> dan <strong className="text-slate-900">npm</strong> yang terpasang di sistem operasi Anda.
            </p>
            <div className="relative rounded-xl bg-slate-50 p-4 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                <span>Bash / Terminal</span>
                <button
                  onClick={() => copyCode("npm install\nnpm run dev", 1)}
                  className="flex items-center gap-1 hover:text-blue-600 font-sans font-bold"
                >
                  {copiedIndex === 1 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedIndex === 1 ? 'Disalin' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-slate-500"># 1. Pasang seluruh dependensi proyek</p>
              <p className="text-blue-700 font-bold">npm install</p>
              <p className="text-slate-500 mt-2"># 2. Jalankan server full-stack dev (port 3000)</p>
              <p className="text-blue-700 font-bold">npm run dev</p>
            </div>
          </section>

          {/* Section 3: Pengaturan Kunci API (API Keys) */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold">3</span>
              <span>Pengaturan API Key & Keamanan Lingkungan Server</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Sesuai kaidah keamanan <em>Zero Client Secret Exposure</em>, seluruh kunci API disimpan eksklusif pada berkas lingkungan server (<code>.env</code>) atau Google AI Studio Secrets Panel:
            </p>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
              <p className="text-blue-700 font-bold"># Model Utama (Google AI Studio Gemini)</p>
              <p>GEMINI_API_KEY="AIzaSy..."</p>
              <p className="text-purple-700 font-bold mt-2"># Opsional Provider Fallback Gratis</p>
              <p>GROQ_API_KEY="gsk_..."</p>
              <p>OPENROUTER_API_KEY="sk-or-..."</p>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              * Di Google AI Studio, <code>GEMINI_API_KEY</code> diinjeksi secara otomatis pada saat runtime. Anda tidak perlu memasukkan kunci ini secara manual di frontend.
            </p>
          </section>

          {/* Section 4: Konfigurasi Firebase */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold">4</span>
              <span>Konfigurasi Firebase Authentication & Firestore</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Aplikasi ini telah diprovisi dengan Cloud Firestore dan Firebase Authentication melalui AI Studio.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-600 font-medium">
              <li><strong className="text-slate-900">Google Sign-In:</strong> Menggunakan <code>signInWithPopup</code> untuk autentikasi direktur kantor yang aman.</li>
              <li><strong className="text-slate-900">Firestore Collections:</strong>
                <ul className="list-disc list-inside pl-4 text-slate-500 space-y-0.5 mt-1">
                  <li><code>/users/{'{userId}'}</code>: Profil isolasi PII user.</li>
                  <li><code>/tasks/{'{taskId}'}</code>: Dokumen tugas, riwayat eksekusi langkah, dan laporan akhir.</li>
                  <li><code>/activity/{'{activityId}'}</code>: Feed log kantor real-time.</li>
                </ul>
              </li>
              <li><strong className="text-slate-900">Firestore Rules:</strong> Aturan ketat dengan default-deny catch-all dan validasi ID path untuk mencegah modifikasi ilegal antar-user.</li>
            </ul>
          </section>

          {/* Section 5: Pengujian (Testing) */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold">5</span>
              <span>Skenario Pengujian Sistem (System Testing)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-emerald-700">Uji 1: Multi-Agent Workflow</p>
                <p className="text-slate-600 font-medium">
                  Klik tombol <strong>"Kirim Tugas ke Kantor"</strong>, pilih salah satu template (misal: Roadmap AI), dan klik jalankan. Pantau progress bar dan kontribusi dari 5 agen.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-blue-700">Uji 2: Pengujian Fallback Resiliency</p>
                <p className="text-slate-600 font-medium">
                  Buka menu <strong>"Status Provider & API"</strong> dan jalankan <em>Ping Test</em>. Jika kuota model utama habis, sistem secara mulus beralih ke engine cadangan tanpa memutus alur kerja.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-purple-700">Uji 3: Kustomisasi Agen 3D</p>
                <p className="text-slate-600 font-medium">
                  Klik meja kerja salah satu agen (misal David Kim), ubah System Prompt atau Role-nya, lalu klik Simpan. Tugas berikutnya akan menggunakan personalisasi baru tersebut.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-amber-700">Uji 4: Ekspor Laporan Resmi</p>
                <p className="text-slate-600 font-medium">
                  Setelah tugas selesai, klik <strong>"Buka Laporan Lengkap"</strong> dan uji fitur Salin Markdown, Unduh berkas .MD, atau Cetak/PDF.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Deployment */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold">6</span>
              <span>Deployment ke Produksi</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Untuk mengompilasi dan menjalankan versi produksi siap saji:
            </p>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
              <p className="text-slate-500"># Bangun bundle frontend Vite</p>
              <p className="text-blue-700 font-bold">npm run build</p>
              <p className="text-slate-500 mt-2"># Jalankan server Express produksi</p>
              <p className="text-blue-700 font-bold">npm start</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Panduan Resmi AI Employee Office</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};
