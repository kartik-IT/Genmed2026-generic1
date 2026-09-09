import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { captureGlobalErrors } from './lib/errorReporting';

// Install global error/rejection handlers before mounting React
captureGlobalErrors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
