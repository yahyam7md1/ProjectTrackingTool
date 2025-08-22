import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TestPageCard from './TestPageCard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TestPageCard />
  </StrictMode>,
)
