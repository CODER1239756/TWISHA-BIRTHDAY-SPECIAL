import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './styles/tokens.css';
import './styles/glass.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      label="app"
      fallback={
        <div className="boot-message" role="alert">
          Twisha's Garden hit an unexpected error. Please reload the page.
        </div>
      }
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
