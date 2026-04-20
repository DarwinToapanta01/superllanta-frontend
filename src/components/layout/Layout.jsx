import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Dashboard from '../../pages/Dashboard'
import Insumos from '../../pages/Insumos'
import Clientes from '../../pages/Clientes'
import Vulcanizados from '../../pages/Vulcanizados'
import Reparaciones from '../../pages/Reparaciones'


export default function Layout() {
    return (
        <div className="flex h-screen bg-[#F5F6FA]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-5">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/insumos" element={<Insumos />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/vulcanizados" element={<Vulcanizados />} />
                        <Route path="/reparaciones" element={<Reparaciones />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}