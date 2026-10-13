import React, { useState } from 'react';
import { Task, Agent } from '../types';
import { AgentAvatar3D } from './AgentAvatar3D';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  FileText, 
  Clock, 
  Cpu, 
  Users 
} from 'lucide-react';

interface ReportViewerProps {
  task: Task | null;
  onClose: () => void;
  agents: Agent[];
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  task,
  onClose,
  agents
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'contributions'>('report');

  if (!task || !task.finalReport) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(task.finalReport || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (extension: 'md' | 'txt') => {
    const filename = `${task.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_report.${extension}`;
    const blob = new Blob([task.finalReport || ''], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                  Laporan Resmi Kantor Virtual
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(task.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                {task.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              title="Salin Markdown"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              onClick={() => downloadFile('md')}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors hidden sm:flex shadow-2xs"
              title="Unduh Berkas Markdown"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh .MD</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors hidden sm:flex shadow-2xs"
              title="Cetak atau Simpan PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sub-header Metadata & Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-blue-600" />
              <span>Engine: <strong className="text-slate-900">{task.metrics?.providerUsed || 'Gemini 3.8 Flash'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Durasi: <strong className="text-slate-900">{task.metrics?.totalDurationSeconds || 5}s</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-purple-600" />
              <span>Karyawan: <strong className="text-slate-900">{task.steps.length} Agen</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'report' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dokumen Eksekutif
            </button>
            <button
              onClick={() => setActiveTab('contributions')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'contributions' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kontribusi Agen ({task.steps.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {activeTab === 'report' ? (
            <div className="max-w-none text-slate-800 whitespace-pre-wrap font-sans text-sm leading-relaxed space-y-4">
              {task.finalReport}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Berikut adalah draf kerja dan kontribusi yang disusun secara spesifik oleh masing-masing agen dalam tim sebelum dikompilasi menjadi dokumen eksekutif:
              </p>
              {task.steps.map((step, idx) => {
                const agent = agents.find(a => a.id === step.agentId) || {
                  id: step.agentId,
                  name: step.agentName,
                  role: step.stageName,
                  color: '#3B82F6',
                  avatar3d: 'lead',
                  department: 'Leadership'
                } as Agent;

                return (
                  <div key={idx} className="rounded-xl bg-slate-50 border border-slate-200 p-4 shadow-2xs">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200 mb-3">
                      <AgentAvatar3D agent={agent} size="sm" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{step.agentName}</h4>
                        <p className="text-xs text-slate-500 font-medium">{step.stageName}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {step.details || 'Tidak ada catatan draf.'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>AI Employee Office • Dokumen Resmi Terverifikasi</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors"
          >
            Tutup Laporan
          </button>
        </div>
      </div>
    </div>
  );
};
