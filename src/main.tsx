import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './app/redux/store.ts'
import { SocketProvider } from './app/components/Notification/hooks/SocketProvider.tsx'
import { TimerProvider } from './app/providers'
import './i18n.js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <TimerProvider>
            <App />
            <ToastContainer />
          </TimerProvider>
        </SocketProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </Provider>
)
