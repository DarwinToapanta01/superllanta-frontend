import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'

const MEDIDAS_TRANSPORTE = [
    // Camiones medianos
    '7.50R16', '7.50R15', '8.25R16', '8.25R15',
    // Camiones pesados
    '11R22.5', '11R24.5', '12R22.5', '12R24.5',
    // Buses
    '9.00R20', '10.00R20', '295/80R22.5',
    // Tractocamiones
    '315/80R22.5', '295/75R22.5', '275/80R22.5',
    // Volquetas
    '12.00R20', '12.00R24', '13.00R22.5',
    // Medianas
    '215/75R17.5', '225/75R17.5', '235/75R17.5',
    '245/70R17.5', '265/70R17.5', '245/70R19.5',
]

export default function BuscadorMedida({ value, onChange, error, placeholder = 'Ej: 11R22.5' }) {
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

    const medidasFiltradas = busqueda.length === 0 ? [] : MEDIDAS_TRANSPORTE.filter(m =>
        m.toLowerCase().includes(busqueda.toLowerCase())
    ).slice(0, 8)

    const seleccionar = (medida) => {
        setBusqueda(medida)
        onChange(medida)
        setAbierto(false)
    }

    const handleChange = (e) => {
        const val = e.target.value
        setBusqueda(val)
        onChange(val)
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
                    className={`w-full h-9 border rounded-lg pl-7 pr-3 text-sm font-mono focus:outline-none focus:border-[#2563A8] ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                />
            </div>

            {abierto && medidasFiltradas.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {medidasFiltradas.map(m => (
                        <div key={m}
                            onMouseDown={() => seleccionar(m)}
                            className="px-3 py-2 text-sm font-mono text-[#1A2332] hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                            {m}
                        </div>
                    ))}
                    {!MEDIDAS_TRANSPORTE.includes(busqueda) && busqueda.trim() && (
                        <div
                            onMouseDown={() => seleccionar(busqueda)}
                            className="px-3 py-2 text-xs text-[#2563A8] hover:bg-blue-50 cursor-pointer border-t border-gray-100">
                            Usar "<strong className="font-mono">{busqueda}</strong>" como medida nueva
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}