import React, { useState, useMemo, useEffect } from 'react';
import { User, Phone, Wrench, Clock, MapPin, Calendar } from 'lucide-react';
import { 
  OPERATING_HOURS, SERVICE_TYPES, DURATIONS, 
  minutesToTimeStr, timeToMinutes, format12Hour, checkSlotAvailability, getTodayString,
  formatDisplayDate // <--- Add this import here
} from '../utils/schedulerEngine';

export default function ClientPortal({ jobs, onAddJob, selectedDate, setSelectedDate, triggerNotification }) {
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0].name);
  const [location, setLocation] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedStartTime, setSelectedStartTime] = useState(null);

  const todayStr = getTodayString();

  // Identify the 4th option dynamically (Boorfiting)
  const lockedService = SERVICE_TYPES[3]?.name || 'Boorfiting';

  // Automatically enforce and lock 3 hours (180 mins) if the 4th option is chosen
  useEffect(() => {
    if (serviceType === lockedService) {
      setSelectedDuration(180);
      setSelectedStartTime(null); // Clear selected slot to re-validate with new duration bounds
    }
  }, [serviceType, lockedService]);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let min = OPERATING_HOURS.start * 60; min < OPERATING_HOURS.end * 60; min += 30) {
      slots.push(minutesToTimeStr(min));
    }
    return slots;
  }, []);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !phoneNumber || !location || !selectedStartTime) {
      triggerNotification('Please fill all parameters and select an available time window.', 'error');
      return;
    }

    const status = checkSlotAvailability(selectedStartTime, selectedDuration, selectedDate, jobs);
    if (!status.available) {
      triggerNotification(`Booking failure: ${status.reason}`, 'error');
      return;
    }

    const startMin = timeToMinutes(selectedStartTime);
    const endTimeStr = minutesToTimeStr(startMin + selectedDuration);

    onAddJob({
      id: `job_${Date.now()}`,
      clientName,
      phoneNumber,
      serviceType,
      location,
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: endTimeStr,
      duration: selectedDuration
    });

    setClientName('');
    setPhoneNumber('');
    setLocation('');
    setSelectedStartTime(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <form onSubmit={handleBookingSubmit} className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Client Registration</h2>
          <p className="text-xs text-slate-400">Provide parameters for validation filtering.</p>
        </div>
        <hr className="border-slate-800" />
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Client Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Your Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Service Type</label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 appearance-none">
                  {SERVICE_TYPES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Job Duration</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select 
                  value={selectedDuration} 
                  disabled={serviceType === lockedService} // Locks input completely when 4th option is chosen
                  onChange={(e) => { setSelectedDuration(Number(e.target.value)); setSelectedStartTime(null); }} 
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 appearance-none ${serviceType === lockedService ? 'opacity-50 cursor-not-allowed bg-slate-950 text-teal-400 font-semibold' : ''}`}
                >
                  {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Location Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <textarea required rows={2} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Your Location Details" className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 resize-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Operations Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="date" 
                required 
                min={todayStr}
                value={selectedDate} 
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedStartTime(null); }} 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500" 
              />
            </div>
          </div>
        </div>
        <button type="submit" className="w-full mt-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 text-sm font-bold py-3 px-4 rounded-xl active:scale-[0.99] transition-all shadow-lg shadow-teal-500/10">
          Execute Structural Booking
        </button>
      </form>

      <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Available Operational Matrix</h2>
            <p className="text-xs text-slate-400">
  Calculated configuration bounds for <span className="text-teal-400 font-medium">{formatDisplayDate(selectedDate)}</span>
</p>
          </div>
        </div>
        <hr className="border-slate-800 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {timeSlots.map((slot) => {
            const availability = checkSlotAvailability(slot, selectedDuration, selectedDate, jobs);
            const isChosen = selectedStartTime === slot;
            return (
              <button key={slot} type="button" disabled={!availability.available} onClick={() => setSelectedStartTime(slot)} className={`group relative p-3 rounded-xl border text-left transition-all ${!availability.available ? 'bg-rose-950/20 border-rose-950/40 opacity-45 cursor-not-allowed text-rose-300/40' : isChosen ? 'bg-teal-950/60 border-teal-500 text-teal-300 ring-2 ring-teal-500/20' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold font-mono ${isChosen ? 'text-teal-400' : 'text-white'}`}>{format12Hour(slot)}</span>
                  {!availability.available && <span className="text-[10px] uppercase font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-900/50">Locked</span>}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{availability.available ? `Ends: ${format12Hour(minutesToTimeStr(timeToMinutes(slot) + selectedDuration))}` : availability.reason}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}