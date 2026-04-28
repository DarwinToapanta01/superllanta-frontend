import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'

const MARCAS_NEUMATICO = [
    'Michelin', 'Bridgestone', 'Goodyear', 'Continental', 'Pirelli',
    'Dunlop', 'Hankook', 'Yokohama', 'Firestone', 'BFGoodrich',
    'Toyo', 'Kumho', 'Falken', 'Nitto', 'Cooper',
    'General', 'Lasso', 'Fate', 'Semperit', 'Uniroyal',
    'Maxxis', 'Leao', 'Triangle', 'Linglong', 'Sailun',
    'Roadstone', 'Nexen', 'Atlas', 'Westlake', 'Doublestar',
    'Double Coin', 'Warrior', 'Boto', 'Giti', 'Arisun'
]

export default function BuscadorMarca({ value, onChange, error, placeholder = 'Ej: Michelin' }) {
    const [busqueda, setBusqueda] = useState(value || '')
    const [abierto, setAbierto] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        setBusqueda(value || '')
    }, [value])

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const marcasFiltradas = busqueda.length === 0 ? [] : MARCAS_NEUMATICO.filter(m =>
        m.toLowerCase().includes(busqueda.toLowerCase())
    ).slice(0, 6)

    const seleccionar = (marca) => {
        setBusqueda(marca)
        onChange(marca)
        setAbierto(false)
    }

    const handleChange = (e) => {
        const val = e.target.value
        setBusqueda(val)
        onChange(val) // permite escribir libremente también
        setAbierto(true)
    }

    return (
        <div ref={ref} className="relative">
            <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    value={busqueda}
                    onChange={handleChange}
                    onFocus={() => setAbierto(true)}
                    placeholder={placeholder}
                    className={`w-full h-9 border rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:border-[#2563A8] ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                />
            </div>

            {/* Dropdown */}
            {abierto && marcasFiltradas.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {marcasFiltradas.map(m => (
                        <div key={m}
                            onMouseDown={() => seleccionar(m)}
                            className="px-3 py-2 text-sm text-[#1A2332] hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                            {m}
                        </div>
                    ))}
                    {/* Opción de usar texto libre si no coincide exacto */}
                    {!MARCAS_NEUMATICO.includes(busqueda) && busqueda.trim() && (
                        <div
                            onMouseDown={() => seleccionar(busqueda)}
                            className="px-3 py-2 text-xs text-[#2563A8] hover:bg-blue-50 cursor-pointer border-t border-gray-100">
                            Usar "<strong>{busqueda}</strong>" como marca nueva
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}