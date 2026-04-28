import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus } from 'lucide-react'
import api from '../../services/api'

export default function BuscadorMarca({ value, onChange, error, placeholder = 'Ej: Michelin' }) {
    const queryClient = useQueryClient()
    const [busqueda, setBusqueda] = useState(value || '')
    const [abierto, setAbierto] = useState(false)
    const ref = useRef(null)

    const { data: marcas = [] } = useQuery({
        queryKey: ['marcas'],
        queryFn: () => api.get('/marcas').then(r => r.data)
    })

    const mutacionGuardar = useMutation({
        mutationFn: (nombre) => api.post('/marcas', { nombre }),
        onSuccess: () => queryClient.invalidateQueries(['marcas'])
    })

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

    const marcasFiltradas = busqueda.length === 0 ? [] : marcas.filter(m =>
        m.toLowerCase().includes(busqueda.toLowerCase())
    ).slice(0, 6)

    const esNueva = busqueda.trim() &&
        !marcas.some(m => m.toLowerCase() === busqueda.toLowerCase().trim())

    const seleccionar = (marca) => {
        setBusqueda(marca)
        onChange(marca)
        setAbierto(false)
    }

    const seleccionarNueva = () => {
        const nombre = busqueda.trim()
        mutacionGuardar.mutate(nombre)
        seleccionar(nombre)
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
                    className={`w-full h-9 border rounded-lg pl-7 pr-3 text-sm focus:outline-none focus:border-[#2563A8] ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                />
            </div>

            {abierto && (marcasFiltradas.length > 0 || esNueva) && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {/* Marcas existentes */}
                    {marcasFiltradas.map(m => (
                        <div key={m}
                            onMouseDown={() => seleccionar(m)}
                            className="px-3 py-2 text-sm text-[#1A2332] hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                            {m}
                        </div>
                    ))}

                    {/* Opción de guardar nueva marca */}
                    {esNueva && (
                        <div
                            onMouseDown={seleccionarNueva}
                            className="px-3 py-2 text-xs text-[#2563A8] hover:bg-blue-50 cursor-pointer border-t border-gray-100 flex items-center gap-2">
                            <Plus size={11} />
                            <span>Guardar "<strong>{busqueda.trim()}</strong>" como nueva marca</span>
                        </div>
                    )}
                </div>
            )}

            {/* Sin resultados */}
            {abierto && busqueda.length > 0 && marcasFiltradas.length === 0 && !esNueva && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs text-gray-400">
                    No se encontraron marcas
                </div>
            )}
        </div>
    )
}