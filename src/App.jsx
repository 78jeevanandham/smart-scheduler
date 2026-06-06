import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import ClientPortal from './components/ClientPortal';
import AdminTimeline from './components/AdminTimeline';
import { getTodayString } from './utils/schedulerEngine';
import { ShieldAlert, Eye, EyeOff, Lock, LogOut } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useLocalStorage('smartsync_jobs', []);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [view, setView] = useState('client'); // 'client' or 'admin'
  const [notification, setNotification] = useState(null);

  // Authentication State Layers
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useLocalStorage('smartsync_admin_auth', false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hardcoded secure credential token string for pure frontend verification
  const ADMIN_PASSPHRASE = 'Admin@2026';

  const triggerNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddJob = (newJob) => {
    setJobs((prevJobs) => [...prevJobs, newJob]);
    triggerNotification(`Structural booking created for ${newJob.clientName}`);
  };

  const handleDeleteJob = (jobId, clientName) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    triggerNotification(`Schedule removed. Slot is now vacant.`, 'error');
  };

  // Auth processing loops
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSPHRASE) {
      setIsAdminAuthenticated(true);
      setPasswordInput('');
      triggerNotification('Access granted. Welcome back, Administrator.');
    } else {
      triggerNotification('Access denied. Invalid signature configuration.', 'error');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setView('client');
    triggerNotification('Admin security session terminated.', 'error');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased p-4 sm:p-8">
      {/* Dynamic Alerts Banner */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl transition-all duration-300 ${
          notification.type === 'error' 
            ? 'bg-rose-950/90 border-rose-500 text-rose-200' 
            : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
        }`}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Application Control Header */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
            SmartSync Engine v4
          </h1>
          <p className="text-xs text-slate-400 mt-1">Automated Operations Vector & Allocation Router</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setView('client')} 
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${view === 'client' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Client Interface
            </button>
            <button 
              onClick={() => setView('admin')} 
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${view === 'admin' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Admin Timeline Dashboard
            </button>
          </div>

          {/* Render logout option only if authorized */}
          {isAdminAuthenticated && (
            <button 
              onClick={handleAdminLogout}
              className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:border-rose-900 transition-all"
              title="Secure Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Workspace View Router */}
      <main className="max-w-7xl mx-auto">
        {view === 'client' && (
          <ClientPortal 
            jobs={jobs} 
            onAddJob={handleAddJob} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate}
            triggerNotification={triggerNotification}
          />
        )}

        {view === 'admin' && (
          !isAdminAuthenticated ? (
            /* Glassmorphic Cyberpunk Login Overlay Protection */
            <div className="max-w-md mx-auto mt-12 bg-slate-950/60 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
              <div className="text-center space-y-3 mb-6">
                <div className="inline-flex p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">System Gatekeeper Verification</h2>
                <p className="text-xs text-slate-400">Admin credentials required to modify current configuration bounds.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Security Passphrase
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-11 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-mono tracking-widest"
                    />
                    {/* Usability Show/Hide Icon Feature */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 text-sm font-bold py-2.5 rounded-xl active:scale-[0.99] transition-all shadow-lg shadow-teal-500/10"
                >
                  Verify Signature
                </button>
              </form>
            </div>
          ) : (
            <AdminTimeline 
              jobs={jobs} 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onDeleteJob={handleDeleteJob}
            />
          )
        )}
      </main>
    </div>
  );
}