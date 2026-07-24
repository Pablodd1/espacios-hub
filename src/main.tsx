import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { bootstrapLiveData } from './lib/liveBootstrap';

const rootEl = document.getElementById('root')!;

// Minimal splash while the live database loads (instant in demo mode)
rootEl.innerHTML = `
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#06090E;color:#9AA4B2;font-family:Inter,system-ui,sans-serif;font-size:14px;letter-spacing:0.04em">
    Cargando Espacios Hub…
  </div>`;

bootstrapLiveData()
  .catch(() => ({ live: false }))
  .finally(() => {
    createRoot(rootEl).render(<App />);
  });
