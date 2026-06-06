import React, { useMemo } from 'react';
import { Trash2, Trash, AlertCircle, Calendar } from 'lucide-react';import { format12Hour, getTodayString, formatDisplayDate } from '../utils/schedulerEngine';

export default function AdminTimeline({ jobs, selectedDate, setSelectedDate, onDeleteJob }) {
  
  // Filter jobs targeting only the currently viewed dashboard date parameter
  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => job.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [jobs, selectedDate]);

  // 🔴 PASTE THE WIPE LOGIC FUNCTION HERE:
  const handleHardSystemReset = () => {
    if (window.confirm("CRITICAL WARNING: This will permanently wipe all client bookings and reset the dashboard matrix. Proceed?")) {
      window.localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      {/* Control Module Header Bar */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
  <h2 className="text-lg font-bold text-white">System Allocation Monitoring</h2>
  <p className="text-xs text-slate-400 mt-0.5">Global overview for {formatDisplayDate(selectedDate)}</p>
</div>
{/* 🔴 PASTE THE BUTTON UI LAYER HERE: */}
          <button 
            type="button"
            onClick={handleHardSystemReset}
            className="px-4 py-2 bg-rose-950/40 border border-rose-900/60 text-rose-400 text-xs font-mono font-bold uppercase rounded-xl hover:bg-rose-600 hover:text-slate-950 hover:border-rose-500 transition-all cursor-pointer active:scale-95"
          >
            Clear All Cache Records
          </button>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500" 
          />
        </div>
      </div>

      {/* Main Table Overview Grid & Vacate Controller */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Workspace Directives ({filteredJobs.length})
          </h3>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-slate-600" />
            <p className="text-sm font-medium">No system allocations programmed for this timeline vector.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-4 font-semibold">Timeline Window</th>
                  <th className="p-4 font-semibold">Client Profiles</th>
                  <th className="p-4 font-semibold">Operational Task</th>
                  <th className="p-4 font-semibold">Deployment Target</th>
                  <th className="p-4 font-semibold text-right">System Override Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="p-4 font-mono font-bold text-teal-400 whitespace-nowrap">
                      {format12Hour(job.startTime)} - {format12Hour(job.endTime)}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{job.clientName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{job.phoneNumber}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                        {job.serviceType}
                      </span>
                    </td>
                    <td className="p-4 max-w-[200px] truncate text-slate-400">
                      {job.location}
                    </td>
                    <td className="p-4 text-right">
                      {/* NEW: Action button triggers state removal filter loop immediately */}
                      <button
                        type="button"
                        onClick={() => onDeleteJob(job.id, job.clientName)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-950 text-rose-400 bg-rose-950/20 hover:bg-rose-500 hover:text-slate-950 hover:border-rose-400 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all"
                        title="Delete and clear slot allocations"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        Cancel & Vacate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}