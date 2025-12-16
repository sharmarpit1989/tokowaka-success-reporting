/**
 * useSessionStorage Hook
 * Custom hook for session storage with automatic persistence
 */

import { useState, useEffect } from 'react';

export function useSessionStorage(key, initialValue) {
  // Get initial value from sessionStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error loading from sessionStorage:', error);
      return initialValue;
    }
  });

  // Save to sessionStorage whenever value changes
  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useSessionStorage;

