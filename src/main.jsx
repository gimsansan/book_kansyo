import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ensureDragMock } from './lib/storage.js'
import './index.css'

ensureDragMock()

// 서비스 워커가 있어야 설치형 앱이 되고, 그래야 공유 메뉴에 "북칸쇼"가 뜬다.
// 개발 중에는 캐시가 방해되므로 빌드본에서만 등록한다.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
