import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers for IndexedDB / Firestore / Storage closing, hidden, or offline network errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '').toLowerCase();
    if (
      reasonStr.includes('database is closing') ||
      reasonStr.includes('database is hidden') ||
      reasonStr.includes('indexeddb') ||
      reasonStr.includes('firestore') ||
      reasonStr.includes('quotaexceeded') ||
      reasonStr.includes('could not reach cloud firestore') ||
      reasonStr.includes('unavailable') ||
      reasonStr.includes('failed to get document')
    ) {
      console.warn('Caught background database/network event:', event.reason);
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const errorStr = String(event.error?.message || event.message || '').toLowerCase();
    if (
      errorStr.includes('database is closing') ||
      errorStr.includes('database is hidden') ||
      errorStr.includes('indexeddb') ||
      errorStr.includes('quotaexceeded') ||
      errorStr.includes('could not reach cloud firestore') ||
      errorStr.includes('unavailable')
    ) {
      console.warn('Caught background storage/database window error:', event.error);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

