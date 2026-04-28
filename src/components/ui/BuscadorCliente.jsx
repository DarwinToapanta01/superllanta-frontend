import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientesService } from '../../services/clientes'
import { Search, X, User, Building2 } from 'lucide-react'

export default function BuscadorCliente({ idCliente, onChange, error, placeholder = 'Buscar cliente por nombre o cédula...' }) {
    const [busqueda, setBusqueda] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
    const ref = useRef(null)

    const { data: clientes = [] } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => clientesService.listar().then(r => r.data)
    })

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setAbierto(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Cargar cliente inicial si viene de edición
    useEffect(() => {
        if (idCliente && clientes.length > 0 && !clienteSeleccionado) {
            const c = clientes.find(c => c.id_cliente === parseInt(idCliente))
            if (c) setClienteSeleccionado(c)
        }
    }, [idCliente, clientes])

    const clientesFiltrados = busqueda.length < 1 ? [] : clientes.filter(c => {
        const texto = `${c.nombre} ${c.apellido || ''} ${c.cedula || ''} ${c.nombre_empresa || ''}`.toLowerCase()
        return texto.includes(busqueda.toLowerCase())
    }).slice(0, 8) // máximo 8 resultados

    const seleccionar = (c) => {
        setClienteSeleccionado(c)
        setBusqueda('')
        setAbierto(false)
        onChange(c.id_cliente)
    }

    const limpiar = () => {
        setClienteSeleccionado(null)
        setBusqueda('')
        onChange('')
    }

    const nombreMostrar = (c) => {
        if (c.tipo_cliente === 'empresa') return c.nombre_empresa || `${c.nombre} ${c.apellido || ''}`
        return `${c.nombre} ${c.apellido || ''}`
    }

    return (
        <div ref={ref} className="relative">
            {clienteSeleccionado ? (
                // Cliente ya seleccionado — mostrar tarjeta
                <div className={`flex items-center gap-2 h-9 border rounded-lg px-3 ${error ? 'border-red-400 bg-red-50' : 'border-[#1C3F6E] bg-blue-50'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${clienteSeleccionado.tipo_cliente === 'empresa' ? 'bg-orange-200' : 'bg-blue-200'
                        }`}>
                        {clienteSeleccionado.tipo_cliente === 'empresa'
                            ? <Building2 size={10} className="text-orange-700" />
                            : <User size={10} className="text-[#1C3F6E]" />
                        }
                    </div>
                    <span className="text-sm font-medium text-[#1A2332] flex-1 truncate">
                        {nombreMostrar(clienteSeleccionado)}
                    </span>
                    {clienteSeleccionado.cedula && (
                        <span className="text-[10px] text-gray-500 flex-shrink-0">
                            {clienteSeleccionado.cedula}
                        </span>
                    )}
                    <button type="button" onClick={limpiar}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                // Campo de búsqueda
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        value={busqueda}
                        onChange={e => { setBusqueda(e.target.value); setAbierto(true) }}
                        onFocus={() => setAbierto(true)}
                        placeholder={placeholder}
                        className={`w-full h-9 border rounded-lg pl-8 pr-3 text-sm focus:outline-none focus:border-[#2563A8] ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`}
                    />
                </div>
            )}

            {/* Dropdown de resultados */}
            {abierto && clientesFiltrados.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {clientesFiltrados.map(c => (
                        <div key={c.id_cliente}
                            onMouseDown={() => seleccionar(c)}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${c.tipo_cliente === 'empresa' ? 'bg-orange-100' : 'bg-blue-100'
                                }`}>
                                {c.tipo_cliente === 'empresa'
                                    ? <Building2 size={12} className="text-orange-600" />
                                    : <User size={12} className="text-[#1C3F6E]" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#1A2332] truncate">
                                    {nombreMostrar(c)}
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-2">
                                    {c.tipo_cliente === 'empresa' && (
                                        <span className="text-orange-500">Empresa</span>
                                    )}
                                    {c.cedula && <span>{c.cedula}</span>}
                                    {c.telefono && <span>{c.telefono}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sin resultados */}
            {abierto && busqueda.length >= 1 && clientesFiltrados.length === 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs text-gray-400 text-center">
                    No se encontraron clientes con "{busqueda}"
                </div>
            )}

            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        </div>
    )
}