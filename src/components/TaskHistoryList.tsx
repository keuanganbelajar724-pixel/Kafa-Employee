import React, { useState } from 'react';
import { Task } from '../types';
import { 
  FileText, 
  Clock, 
  Trash2, 
  Cpu, 
  Search,
  Layers
} from 'lucide-react';

interface TaskHistoryListProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskHistoryList: React.FC<TaskHistoryListProps> = ({
  tasks,
  onSelectTask,
  onDeleteTask
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-200">Mendesak</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">Tinggi</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">Sedang</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">Rendah</span>;
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Arsip & Riwayat Pekerjaan Kantor ({tasks.length})
          </h3>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tugas..."
              className="pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="all">Semua</option>
            <option value="completed">Selesai</option>
            <option value="in_progress">Berjalan</option>
            <option value="failed">Gagal</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-400 font-medium">
          Tidak ada data tugas yang sesuai dengan pencarian.
        </div>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {filteredTasks.map((t) => {
            const isCompleted = t.status === 'completed';
            const isInProgress = t.status === 'in_progress';

            return (
              <div
                key={t.id}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all hover:bg-slate-100/70"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {getPriorityBadge(t.priority)}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(t.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h4 
                    onClick={() => isCompleted && onSelectTask(t)}
                    className={`text-sm font-bold text-slate-900 transition-colors truncate ${
                      isCompleted ? 'cursor-pointer hover:text-blue-600' : ''
                    }`}
                  >
                    {t.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
                    {t.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <Cpu className="h-3 w-3 text-blue-600" />
                      {t.metrics?.providerUsed || 'Gemini AI'}
                    </span>
                    <span>• {t.steps?.length || 0} Tahap Agen</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isCompleted && (
                    <button
                      onClick={() => onSelectTask(t)}
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Buka Laporan</span>
                    </button>
                  )}

                  {isInProgress && (
                    <span className="flex items-center gap-1.5 text-xs text-amber-700 font-bold px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                      <Clock className="h-3.5 w-3.5 animate-spin text-amber-600" />
                      <span>Sedang Dikerjakan</span>
                    </span>
                  )}

                  <button
                    onClick={() => onDeleteTask(t.id)}
                    type="button"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-200 transition-colors"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
