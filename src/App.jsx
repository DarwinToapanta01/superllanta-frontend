import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/layout/Layout'
import HojaDeVidaQR from './pages/HojaDeVidaQR'


const queryClient = new QueryClient()

const RutaProtegida = ({ children, soloAdmin = false }) => {
  const { usuario, cargando, esAdmin } = useAuth()
  if (cargando) return <div className="flex items-center justify-center h-screen">Cargando...</div>
  if (!usuario) return <Navigate to="/login" />
  if (soloAdmin && !esAdmin) return <Navigate to="/dashboard" />
  return children
}

const AppRoutes = () => {
  const { usuario } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/qr/:codigo" element={<HojaDeVidaQR />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/*" element={
        <RutaProtegida>
          <Layout />
        </RutaProtegida>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}