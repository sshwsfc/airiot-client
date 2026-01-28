import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setConfig, useUser } from '@airiot/client'
import './index.css'
import App from './App.tsx'

const { loadUser } = useUser()
setConfig({
  projectId: 'kesi'
})
loadUser()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
