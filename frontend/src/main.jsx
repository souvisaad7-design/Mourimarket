import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { applyTheme } from './components/AppChrome.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { I18nProvider } from './i18n/index.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { LocationProvider } from './context/LocationContext.jsx';
import './index.css';

applyTheme();

// Offline support + installable app (production builds only).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SettingsProvider>
        <I18nProvider>
          <AppProvider>
            <LocationProvider>
              <App />
            </LocationProvider>
          </AppProvider>
        </I18nProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
