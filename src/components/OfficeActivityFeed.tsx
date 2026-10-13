import React from 'react';
import { ActivityLog, Agent } from '../types';
import { Activity } from 'lucide-react';

interface OfficeActivityFeedProps {
  activities: ActivityLog[];
  agents: Agent[];
}

export const OfficeActivityFeed: React.FC<OfficeActivityFeedProps> = ({
  activities,
  agents
}) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Log Aktivitas Kantor (Live Feed)
          </h3>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
          Real-time
        </span>
      </div>

      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            Belum ada aktivitas baru. Berikan tugas pertama Anda kepada karyawan kantor!
          </div>
        ) : (
          activities.map((act) => {
            const agent = agents.find(a => a.id === act.agentId);
            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 shadow-xs"
                  style={{ backgroundColor: agent?.color || '#3B82F6' }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate">
                      {act.agentName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 font-medium">
                      {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-snug font-medium">
                    {act.details}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
