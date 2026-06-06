import { useState, useEffect } from 'react';

// Increment this number whenever you make major structural changes to your booking data
const CURRENT_SCHEMA_VERSION = 'v1.2'; 

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // 1. Check for system schema version alignment
      const deployedVersion = window.localStorage.getItem('smartsync_schema_version');
      
      if (deployedVersion !== CURRENT_SCHEMA_VERSION) {
        // If a mismatch is detected, clear outdated tracking state to prevent code failures
        window.localStorage.removeItem(key);
        window.localStorage.setItem('smartsync_schema_version', CURRENT_SCHEMA_VERSION);
        return initialValue;
      }

      // 2. Parse existing operational datasets
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Storage Engine Error reading key:", key, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Storage Engine Error setting key:", key, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;