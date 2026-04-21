import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { neumaticosService } from '../services/neumaticos'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import Badge from '../components/ui/Badge'
import { clientesService } from '../services/clientes'
import { useQuery as useQ } from '@tanstack/react-query'
import InputMedida from '../components/ui/InputMedida'
import InputDOT from '../components/ui/InputDOT'
import { Plus, ShoppingCart } from 'lucide-react'

export default function Neumaticos() {
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [modalForm, setModalForm] = useState(false)
    const [modalVenta, setModalVenta] = useState(false)
    const [seleccionado, setSeleccionado] = useState(null)
    const [buscar, setBuscar] = useState('')

    const { data: neumaticos = [], isLoading } = useQuery({
        queryKey: ['neumaticos-venta'],
        queryFn: () => neumaticosService.listarVenta().then(r => r.data)
    })

    const mutacionIngresar = useMutation({
        mutationFn: (data) => neumaticosService.crearVenta(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['neumaticos-venta'])
            setModalForm(false)
            mostrar('Neumático registrado en inventario')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al registrar', 'error')
    })

    const mutacionVenta = useMutation({
        mutationFn: (data) => neumaticosService.registrarVenta(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['neumaticos-venta'])
            setModalVenta(false)
            setSeleccionado(null)
            mostrar('Venta registrada correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al registrar venta', 'error')
    })

    const filtrados = neumaticos.filter(n => {
        const texto = `${n.marca || ''} ${n.medida || ''} ${n.dot || ''}`.toLowerCase()
        return texto.includes(buscar.toLowerCase())
    })

    const disponibles = neumaticos.filter(n => n.estado === 'disponible').length

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { num: neumaticos.length, label: 'Total en inventario', color: '#1C3F6E' },
                    { num: disponibles, label: 'Disponibles', color: '#27AE60' },
                    { num: neumaticos.length - disponibles, label: 'Vendidos', color: '#9ca3af' },
                ].map(({ num, label, color }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold" style={{ color }}>{num}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-4">
                <input value={buscar} onChange={e => setBuscar(e.target.value)}
                    placeholder="Buscar por marca, medida o DOT..."
                    className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
                <button onClick={() => setModalForm(true)}
                    className="h-9 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold px-4 rounded-lg flex items-center gap-2">
                    <Plus size={14} /> Ingresar neumático
                </button>
            </div>

            {/* Tabla */}
            {isLoading ? <Spinner /> : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {['Marca', 'Medida', 'DOT', 'Precio venta', 'Estado', 'Ingreso', 'Acciones'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                                    No hay neumáticos en inventario
                                </td></tr>
                            ) : filtrados.map((n, i) => (
                                <tr key={n.id_neumatico} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                    <td className="px-4 py-3 font-medium text-[#1A2332]">{n.marca}</td>
                                    <td className="px-4 py-3 text-gray-600">{n.medida}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{n.dot || '—'}</td>
                                    <td className="px-4 py-3 font-semibold text-[#1C3F6E]">
                                        ${parseFloat(n.precio || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variante={n.estado === 'disponible' ? 'success' : 'gray'}>
                                            {n.estado === 'disponible' ? 'Disponible' : 'Vendido'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {new Date(n.fecha_registro).toLocaleDateString('es-EC')}
                                    </td>
                                    <td className="px-4 py-3">
                                        {n.estado === 'disponible' && (
                                            <button onClick={() => { setSeleccionado(n); setModalVenta(true) }}
                                                className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                                                <ShoppingCart size={11} /> Vender
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal ingresar */}
            <Modal abierto={modalForm} onCerrar={() => setModalForm(false)}
                titulo="Ingresar neumático al inventario" ancho="max-w-md">
                <FormIngreso
                    onGuardar={(data) => mutacionIngresar.mutate(data)}
                    cargando={mutacionIngresar.isPending}
                    onCancelar={() => setModalForm(false)}
                />
            </Modal>

            {/* Modal venta */}
            <Modal abierto={modalVenta}
                onCerrar={() => { setModalVenta(false); setSeleccionado(null) }}
                titulo="Registrar venta" ancho="max-w-md">
                <FormVenta
                    neumatico={seleccionado}
                    onGuardar={(data) => mutacionVenta.mutate(data)}
                    cargando={mutacionVenta.isPending}
                    onCancelar={() => { setModalVenta(false); setSeleccionado(null) }}
                />
            </Modal>
        </div>
    )
}

// ─── Formulario de ingreso ────────────────────────────────────

function FormIngreso({ onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({
        marca: '', medida: '', dot: '', dotValido: true,
        precio: '', precio_compra: ''
    })
    const [errores, setErrores] = useState({})

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrores(e => ({ ...e, [k]: '' })) }

    const validar = () => {
        const e = {}
        if (!form.marca.trim()) e.marca = 'Requerido'
        if (!form.medida) e.medida = 'Requerido'
        if (!form.precio || parseFloat(form.precio) <= 0) e.precio = 'Ingresa un precio válido'
        if (form.dot && !form.dotValido) e.dot = 'DOT inválido'
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }
        onGuardar({
            marca: form.marca.trim(),
            medida: form.medida,
            dot: form.dot || null,
            precio: parseFloat(form.precio),
            precio_compra: parseFloat(form.precio_compra) || null,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Marca *</label>
                    <input value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Ej: Michelin"
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none ${errores.marca ? 'border-red-400' : 'border-gray-300'}`} />
                    {errores.marca && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Medida *</label>
                    <InputMedida value={form.medida} onChange={v => set('medida', v)} error={errores.medida} />
                    {errores.medida && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">DOT</label>
                    <InputDOT value={form.dot}
                        onChange={(val, esValido) => { set('dot', val); set('dotValido', esValido) }}
                        error={errores.dot} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Precio compra</label>
                    <input type="number" min="0" step="0.01" value={form.precio_compra}
                        onChange={e => set('precio_compra', e.target.value)} placeholder="0.00"
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Precio venta *</label>
                    <input type="number" min="0" step="0.01" value={form.precio}
                        onChange={e => set('precio', e.target.value)} placeholder="0.00"
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none ${errores.precio ? 'border-red-400' : 'border-gray-300'}`} />
                    {errores.precio && <p className="text-[10px] text-red-500 mt-0.5">{errores.precio}</p>}
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Guardando...' : 'Registrar ingreso'}
                </button>
            </div>
        </form>
    )
}

// ─── Formulario de venta ──────────────────────────────────────

function FormVenta({ neumatico, onGuardar, cargando, onCancelar }) {
    const [idCliente, setIdCliente] = useState('')
    const [error, setError] = useState('')

    const { data: clientes = [] } = useQ({
        queryKey: ['clientes'],
        queryFn: () => clientesService.listar().then(r => r.data)
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!idCliente) { setError('Selecciona un cliente'); return }
        onGuardar({
            id_cliente: parseInt(idCliente),
            id_neumatico: neumatico.id_neumatico,
            precio: neumatico.precio
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            {neumatico && (
                <div className="bg-[#1C3F6E] rounded-xl p-3 text-white">
                    <div className="text-xs text-white/50 mb-1">Neumático a vender</div>
                    <div className="text-sm font-semibold">{neumatico.marca} · {neumatico.medida}</div>
                    {neumatico.dot && <div className="text-xs text-white/60 mt-0.5">DOT: {neumatico.dot}</div>}
                    <div className="text-[#F5C400] font-bold mt-1">${parseFloat(neumatico.precio || 0).toFixed(2)}</div>
                </div>
            )}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Cliente *</label>
                <select value={idCliente} onChange={e => { setIdCliente(e.target.value); setError('') }}
                    className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                    <option value="">Selecciona un cliente</option>
                    {clientes.map(c => (
                        <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido || ''}</option>
                    ))}
                </select>
                {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Registrando...' : 'Confirmar venta'}
                </button>
            </div>
        </form>
    )
}