// Updated Operating Hours: 07:00 AM to 06:00 PM
export const OPERATING_HOURS = { start: 7, end: 18 }; 
export const BUFFER_MINUTES = 30;

export const SERVICE_TYPES = [
    
  { id: 'electrical', name: 'Electrical', color: 'bg-amber-500', text: 'text-amber-500' },
  { id: 'plumbing', name: 'Plumbing', color: 'bg-teal-500', text: 'text-teal-500' },
  { id: 'faltwork', name: 'Repairing', color: 'bg-purple-500', text: 'text-purple-500' },
  { id: 'Boorfiting', name: 'Boor fiting', color: 'bg-blue-500', text: 'text-blue-500' },
];

export const DURATIONS = [
  { label: '1 Hour', value: 60 },
  { label: '2 Hours', value: 120 },
  { label: '3 Hours', value: 180 },
];

export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTimeStr = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const format12Hour = (timeStr) => {
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutesStr} ${ampm}`;
};

// Generates local date vector safely matching browser timezone
export const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// 2. NEW: Reverses the string format from YYYY-MM-DD to DD-MM-YYYY for UI display rendering
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

export const checkSlotAvailability = (startTimeStr, durationMinutes, dateStr, currentJobsList) => {
  // Prevent booking retroactively if date is in the past
  const todayStr = getTodayString();
  if (dateStr < todayStr) {
    return { available: false, reason: 'Cannot book past dates' };
  }

  const targetStart = timeToMinutes(startTimeStr);
  const targetEnd = targetStart + durationMinutes;
  const operatingEndMinutes = OPERATING_HOURS.end * 60;

  if (targetEnd > operatingEndMinutes) {
    return { available: false, reason: 'Exceeds Operating Hours' };
  }

  const dailyJobs = currentJobsList.filter(job => job.date === dateStr);

  for (const job of dailyJobs) {
    const jobStart = timeToMinutes(job.startTime);
    const jobEnd = timeToMinutes(job.endTime);

    const protectedStartRange = jobStart - BUFFER_MINUTES;
    const protectedEndRange = jobEnd + BUFFER_MINUTES;

    if (targetStart < protectedEndRange && targetEnd > protectedStartRange) {
      if (targetStart < jobEnd && targetEnd > jobStart) {
        return { available: false, reason: 'Slot Already Booked' };
      }
      return { available: false, reason: 'Buffer Conflict Zone' };
    }
  }

  return { available: true, reason: 'Available' };
};