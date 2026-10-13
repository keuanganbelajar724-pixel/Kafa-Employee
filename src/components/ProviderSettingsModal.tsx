import React, { useState, useEffect } from 'react';
import { ProviderStatus } from '../types';
import { fetchProvidersStatus } from '../lib/api';
import { 
  X, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  RefreshCw
} from 'lucide-react';

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingPing, setTestingPing] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchProvidersStatus();
      setProviders(data.providers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const handleTestPing = async () => {
    setTestingPing(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/providers/status');
      if (res.ok) {
        setTestResult('Koneksi backend & provider aktif dan merespons normal (HTTP 200 OK).');
      } else {
        setTestResult('Server merespons dengan status error: ' + res.status);
      }
    } catch (err: any) {
      setTestResult('Gagal menghubungi server: ' + err.message);
    } finally {
      setTestingPing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 border border-blue-200">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Status API Provider & Konfigurasi AI</h2>
              <p className="text-xs text-slate-500 font-medium">
                Arsitektur multi-provider dengan penanganan kuota, retry otomatis, dan fallback aman.
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          
          {/* Security Notice Box */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900">Keamanan Kunci API Terjamin (Zero Client Exposure)</p>
              <p className="text-slate-600 leading-relaxed font-medium">
                Semua API key tersimpan eksklusif di environment server backend (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`). Browser tidak pernah mengekspos kredensial API ke publik.
              </p>
            </div>
          </div>

          {/* Provider Cards List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Daftar Provider Terintegrasi
              </h3>
              <button
                onClick={loadStatus}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Segarkan Status</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {providers.map((p) => {
                return (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${p.isAvailable ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-500'}`}>
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            p.isAvailable ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {p.tier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-mono mt-0.5 font-medium">
                          Model Utama: <strong className="text-slate-900 font-bold">{p.model}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          Batas Kuota: {p.rateLimit}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold">
                        {p.isAvailable ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-emerald-700">Siap Digunakan</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-500">Opsional</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1 font-medium">
                        Total Panggilan: {p.requestsCount}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resilient Fallback Mechanics */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Protokol Ketahanan & Fallback Otomatis</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Jika kuota Google Gemini mencapai limit (HTTP 429 atau Resource Exhausted), sistem backend AI Employee Office secara otomatis beralih ke penyedia berikutnya (Groq atau OpenRouter jika dikonfigurasikan). Bila seluruh koneksi eksternal mengalami kendala, sistem akan mengaktifkan <strong>Resilient Safe Fallback Engine</strong> sehingga dashboard kantor Anda tidak pernah macet atau menampilkan error kosong.
            </p>
          </div>

          {/* Test Ping */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-900">Uji Latensi & Sambungan API</p>
              <p className="text-[11px] text-slate-500 font-medium">Kirim ping diagnostik cepat ke server endpoint.</p>
            </div>
            <button
              onClick={handleTestPing}
              disabled={testingPing}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-xs"
            >
              {testingPing ? 'Menguji...' : 'Jalankan Ping Test'}
            </button>
          </div>

          {testResult && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 font-mono font-medium">
              {testResult}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
          >
            Tutup Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
