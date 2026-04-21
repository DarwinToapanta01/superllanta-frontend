import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesService } from '../services/clientes'
import { Phone, MapPin } from 'lucide-react'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import FormCliente from '../components/clientes/FormCliente'

export default function Clientes() {
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [buscar, setBuscar] = useState('')
    const [modalForm, setModalForm] = useState(false)
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)

    const { data: clientes = [], isLoading } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => clientesService.listar().then(r => r.data)
    })

    const mutacion = useMutation({
        mutationFn: (data) => clienteSeleccionado
            ? clientesService.actualizar(clienteSeleccionado.id_cliente, data)
            : clientesService.crear(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['clientes'])
            setModalForm(false)
            setClienteSeleccionado(null)
            mostrar(clienteSeleccionado ? 'Cliente actualizado correctamente' : 'Cliente registrado correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al guardar cliente', 'error')
    })

    const clientesFiltrados = clientes.filter(c => {
        const texto = `${c.nombre} ${c.apellido || ''} ${c.cedula || ''}`.toLowerCase()
        return texto.includes(buscar.toLowerCase())
    })

    const abrirNuevo = () => { setClienteSeleccionado(null); setModalForm(true) }
    const abrirEditar = (c) => { setClienteSeleccionado(c); setModalForm(true) }

    const iniciales = (c) => `${c.nombre?.[0] || ''}${c.apellido?.[0] || ''}`.toUpperCase()

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5">
                <input
                    value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar por nombre, apellido o cédula..."
                    className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]"
                />
                <button
                    onClick={abrirNuevo}
                    className="h-9 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold px-4 rounded-lg transition-colors"
                >
                    + Nuevo cliente
                </button>
            </div>

            {/* Grid de tarjetas */}
            {isLoading ? <Spinner /> : (
                <>
                    {clientesFiltrados.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                            {buscar ? 'No se encontraron clientes con ese criterio' : 'Aún no hay clientes registrados. ¡Agrega el primero!'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {clientesFiltrados.map(c => (
                                <div key={c.id_cliente} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1C3F6E] transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-[#E8F0FB] flex items-center justify-center text-sm font-bold text-[#1C3F6E] flex-shrink-0">
                                            {iniciales(c)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-[#1A2332]">{c.nombre} {c.apellido || ''}</div>
                                            <div className="text-[10px] text-gray-500">{c.cedula ? `CI/RUC: ${c.cedula}` : 'Sin cédula registrada'}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 mb-3">
                                        {c.telefono && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Phone size={11} className="flex-shrink-0" />
                                                <span>{c.telefono}</span>
                                            </div>
                                        )}
                                        {c.direccion && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <MapPin size={11} className="flex-shrink-0" />
                                                <span>{c.direccion}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                                        <button
                                            onClick={() => abrirEditar(c)}
                                            className="flex-1 h-7 border border-gray-200 rounded-lg text-xs text-[#1C3F6E] hover:bg-blue-50 transition-colors"
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <Modal
                abierto={modalForm}
                onCerrar={() => { setModalForm(false); setClienteSeleccionado(null) }}
                titulo={clienteSeleccionado ? 'Editar cliente' : 'Nuevo cliente'}
            >
                <FormCliente
                    cliente={clienteSeleccionado}
                    onGuardar={(data) => mutacion.mutate(data)}
                    cargando={mutacion.isPending}
                    onCancelar={() => { setModalForm(false); setClienteSeleccionado(null) }}
                />
            </Modal>
        </div>
    )
}