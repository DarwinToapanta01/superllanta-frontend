import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesService } from '../../services/clientes'
import { Truck, Plus, X, Edit2, CheckCircle } from 'lucide-react'

const TIPOS = {
    camion: 'Camión',
    trailer: 'Tráiler',
    bus: 'Bus',
    volqueta: 'Volqueta',
    otro: 'Otro'
}

const iconoTipo = (tipo) => {
    return <Truck size={13} className="text-[#1C3F6E]" />
}

export default function VehiculosCliente({ idCliente }) {
    const queryClient = useQueryClient()
    const [mostrarForm, setMostrarForm] = useState(false)
    const [editando, setEditando] = useState(null)
    const [form, setForm] = useState({ placa: '', tipo_vehiculo: 'camion', chofer: '' })
    const [errores, setErrores] = useState({})

    const { data: vehiculos = [], isLoading } = useQuery({
        queryKey: ['vehiculos', idCliente],
        queryFn: () => clientesService.vehiculos(idCliente).then(r => r.data),
        enabled: !!idCliente
    })

    const mutacionAgregar = useMutation({
        mutationFn: (data) => editando
            ? clientesService.actualizarVehiculo(editando.id_vehiculo, data)
            : clientesService.agregarVehiculo(idCliente, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['vehiculos', idCliente])
            setMostrarForm(false)
            setEditando(null)
            setForm({ placa: '', tipo_vehiculo: 'camion', chofer: '' })
        }
    })

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }))
        setErrores(e => ({ ...e, [k]: '' }))
    }

    const abrirEditar = (v) => {
        setEditando(v)
        setForm({ placa: v.placa, tipo_vehiculo: v.tipo_vehiculo, chofer: v.chofer || '' })
        setMostrarForm(true)
    }

    const validar = () => {
        const e = {}
        if (!form.placa.trim()) e.placa = 'La placa es requerida'
        if (!form.tipo_vehiculo) e.tipo_vehiculo = 'Selecciona el tipo'
        return e
    }

    const handleSubmit = (ev) => {
        ev.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }
        mutacionAgregar.mutate({
            placa: form.placa.trim().toUpperCase(),
            tipo_vehiculo: form.tipo_vehiculo,
            chofer: form.chofer || null
        })
    }

    if (isLoading) return <div className="text-xs text-gray-400 py-2">Cargando vehículos...</div>

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#1C3F6E] uppercase tracking-wide flex items-center gap-1">
                    <Truck size={12} />
                    Vehículos de la flota ({vehiculos.length})
                </span>
                {!mostrarForm && (
                    <button onClick={() => { setMostrarForm(true); setEditando(null); setForm({ placa: '', tipo_vehiculo: 'camion', chofer: '' }) }}
                        className="flex items-center gap-1 text-xs text-[#2563A8] hover:underline">
                        <Plus size={11} /> Agregar vehículo
                    </button>
                )}
            </div>

            {/* Formulario */}
            {mostrarForm && (
                <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">PLACA *</label>
                            <input value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())}
                                placeholder="Ej: ABC-1234" maxLength={10}
                                className={`w-full h-8 border rounded-lg px-2 text-xs font-mono focus:outline-none ${errores.placa ? 'border-red-400' : 'border-gray-300'}`} />
                            {errores.placa && <p className="text-[10px] text-red-500 mt-0.5">{errores.placa}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">TIPO *</label>
                            <select value={form.tipo_vehiculo} onChange={e => set('tipo_vehiculo', e.target.value)}
                                className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs focus:outline-none">
                                {Object.entries(TIPOS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">CHOFER</label>
                            <input value={form.chofer} onChange={e => set('chofer', e.target.value)}
                                placeholder="Nombre del chofer"
                                className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs focus:outline-none" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button"
                            onClick={() => { setMostrarForm(false); setEditando(null) }}
                            className="h-7 px-3 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={mutacionAgregar.isPending}
                            className="h-7 px-3 bg-[#1C3F6E] text-white text-xs font-semibold rounded-lg disabled:opacity-60">
                            {mutacionAgregar.isPending ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar'}
                        </button>
                    </div>
                </form>
            )}

            {/* Lista de vehículos */}
            {vehiculos.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    No hay vehículos registrados en la flota
                </div>
            ) : (
                <div className="space-y-2">
                    {vehiculos.map(v => (
                        <div key={v.id_vehiculo}
                            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Truck size={14} className="text-[#1C3F6E]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#1C3F6E]">{v.placa}</span>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {TIPOS[v.tipo_vehiculo] || v.tipo_vehiculo}
                                    </span>
                                </div>
                                {v.chofer ? (
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                        Chofer: {v.chofer}
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-gray-400 mt-0.5">Sin chofer asignado</div>
                                )}
                            </div>
                            <button onClick={() => abrirEditar(v)}
                                className="text-gray-400 hover:text-[#1C3F6E] p-1 transition-colors">
                                <Edit2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}