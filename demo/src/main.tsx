import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setConfig } from '@airiot/client'
import './index.css'
import App from './App.tsx'

setConfig({
  projectId: 'ctask',
  user: {
    token: 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc2OTUyNzk1MCwibmJmIjoxNzY4MzE4MzUwLCJpYXQiOjE3NjgzMTgzNTAsInByb2plY3RJZCI6ImN0YXNrIiwiY3VzdG9tIjp7InRva2VuVHlwZSI6InByb2plY3QiLCJ1c2VyTmFtZSI6ImFkbWluIn19.w7DmTc21_chv3GziJvhrTdfT0m2Z9aDSBkgxu09-WDLD7UDfRgepNykktORYGa6OTWgh-6YO390ojtUjrQs-SA'
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
