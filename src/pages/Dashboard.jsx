import { Wrench, Flame, RefreshCw, Package, Truck } from 'lucide-react'

export default function Dashboard() {
    return (
        <div>
            <p className="text-sm text-gray-500 mb-5 uppercase tracking-wide font-semibold text-xs">Resumen del día</p>
            <div className="grid grid-cols-5 gap-3 mb-6">
                {[
                    { Icon: Wrench, valor: '0', label: 'Reparaciones hoy', color: '#1C3F6E' },
                    { Icon: Flame, valor: '0', label: 'Vulcanizados pendientes', color: '#E67E22' },
                    { Icon: RefreshCw, valor: '0', label: 'Reencauches en proceso', color: '#27AE60' },
                    { Icon: Package, valor: '0', label: 'Alertas stock bajo', color: '#E67E22' },
                    { Icon: Truck, valor: '0', label: 'Neumáticos en inventario', color: '#1C3F6E' },
                ].map(({ Icon, valor, label, color }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-xl p-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                            <Icon size={16} className="text-[#1C3F6E]" />
                        </div>
                        <div className="text-xl font-bold" style={{ color }}>{valor}</div>
                        <div className="text-[10px] text-gray-500 mt-1 leading-tight">{label}</div>
                    </div>
                ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center text-sm text-gray-400">
                El dashboard se conectará con datos reales en la siguiente iteración.
            </div>
        </div>
    )
}