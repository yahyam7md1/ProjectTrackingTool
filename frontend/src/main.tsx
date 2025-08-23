import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import TestPageCard from './TestPageCard.tsx';

const rootElement = document.getElementById('root');

// Type assertion to ensure rootElement is not null
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <TestPageCard />
  </StrictMode>,
);
