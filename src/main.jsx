import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AuthProvider from './utils/AuthContext';
import App from './App.jsx';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </AuthProvider>
  </StrictMode>
);
