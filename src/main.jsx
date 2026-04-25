import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <img src="/Logo.png" alt="Loading..." className="w-24 h-24 object-contain animate-pulse" />
        </div>
      }>
        <App />
      </Suspense>
    </QueryClientProvider>
    <ToastContainer position="bottom-right" />
  </StrictMode>,
)
