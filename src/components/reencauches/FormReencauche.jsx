import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientesService } from '../../services/clientes'
import SelectorVehiculo from '../ui/SelectorVehiculo'
import InputMedida from '../ui/InputMedida'
import InputDOT from '../ui/InputDOT'

const TIPOS_REENCAUCHE = ['Caliente', 'Frío', 'Precurado']

const detalleVacio = () => ({
    marca: '', medida: '', dot: '', dotValido: true,
    tipo_reencauche: '', estado_neumatico: '', precio: ''
})

export default function FormReencauche({ onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({
        id_cliente: '', fecha_entrega_estimada: '', abono: '', observaciones: ''
    })
    const [detalles, setDetalles] = useState([detalleVacio()])
    const [errores, setErrores] = useState({})

    const [idVehiculo, setIdVehiculo] = useState(null)
    const [tipoClienteSeleccionado, setTipoClienteSeleccionado] = useState('individual')

    const { data: clientes = [] } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => clientesService.listar().then(r => r.data)
    })

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrores(e => ({ ...e, [k]: '' })) }
    const setDetalle = (i, k, v) => {
        setDetalles(d => d.map((item, idx) => idx === i ? { ...item, [k]: v } : item))
        setErrores(e => ({ ...e, [`${k}_${i}`]: '' }))
    }
    const setDOT = (i, val, esValido) => {
        setDetalles(d => d.map((item, idx) => idx === i ? { ...item, dot: val, dotValido: esValido } : item))
    }

    const agregarDetalle = () => setDetalles(d => [...d, detalleVacio()])
    const eliminarDetalle = (i) => { if (detalles.length > 1) setDetalles(d => d.filter((_, idx) => idx !== i)) }

    const total = detalles.reduce((s, d) => s + (parseFloat(d.precio) || 0), 0)
    const saldo = Math.max(0, total - (parseFloat(form.abono) || 0))

    const validar = () => {
        const e = {}
        if (!form.id_cliente) e.id_cliente = 'Selecciona un cliente'
        detalles.forEach((d, i) => {
            if (!d.marca) e[`marca_${i}`] = 'Requerido'
            if (!d.medida) e[`medida_${i}`] = 'Requerido'
            if (!d.tipo_reencauche) e[`tipo_reencauche_${i}`] = 'Requerido'
            if (!d.precio || parseFloat(d.precio) <= 0) e[`precio_${i}`] = 'Precio inválido'
            if (d.dot && !d.dotValido) e[`dot_${i}`] = 'DOT inválido'
        })
        if (form.abono && parseFloat(form.abono) > total) e.abono = 'El abono no puede superar el total'
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }
        onGuardar({
            id_cliente: parseInt(form.id_cliente),
            id_vehiculo: idVehiculo || null,
            fecha_entrega_estimada: form.fecha_entrega_estimada || null,
            abono: parseFloat(form.abono) || 0,
            observaciones: form.observaciones || null,
            detalles: detalles.map(({ dotValido, ...d }) => ({
                ...d, precio: parseFloat(d.precio)
            }))
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Cliente *</label>
                    <select value={form.id_cliente} onChange={e => {
                        set('id_cliente', e.target.value)
                        setIdVehiculo(null)
                        const cliente = clientes.find(c => c.id_cliente === parseInt(e.target.value))
                        setTipoClienteSeleccionado(cliente?.tipo_cliente || 'individual')
                    }}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.id_cliente ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                        <option value="">Selecciona un cliente</option>
                        {clientes.map(c => (
                            <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido || ''}</option>
                        ))}
                    </select>
                    {errores.id_cliente && <p className="text-[10px] text-red-500 mt-1">{errores.id_cliente}</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Fecha entrega estimada</label>
                    <input type="date" value={form.fecha_entrega_estimada}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => set('fecha_entrega_estimada', e.target.value)}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
                </div>
            </div>

            <SelectorVehiculo
                idCliente={form.id_cliente}
                tipoCliente={tipoClienteSeleccionado}
                idVehiculo={idVehiculo}
                onChange={setIdVehiculo}
                error={errores.idVehiculo}
            />

            {/* Neumáticos */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#1A2332] uppercase tracking-wide">Neumáticos *</label>
                    <button type="button" onClick={agregarDetalle}
                        className="text-xs text-[#2563A8] hover:underline">+ Agregar neumático</button>
                </div>
                <div className="space-y-3">
                    {detalles.map((d, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-[#1C3F6E] bg-blue-50 px-2 py-0.5 rounded-md">
                                    Neumático {i + 1}
                                </span>
                                {detalles.length > 1 && (
                                    <button type="button" onClick={() => eliminarDetalle(i)}
                                        className="text-red-400 hover:text-red-600 text-xs">✕ Eliminar</button>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">MARCA *</label>
                                    <input value={d.marca} onChange={e => setDetalle(i, 'marca', e.target.value)}
                                        placeholder="Ej: Michelin"
                                        className={`w-full h-8 border rounded-lg px-2 text-xs focus:outline-none ${errores[`marca_${i}`] ? 'border-red-400' : 'border-gray-300'}`} />
                                    {errores[`marca_${i}`] && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">MEDIDA *</label>
                                    <InputMedida value={d.medida}
                                        onChange={v => setDetalle(i, 'medida', v)}
                                        error={errores[`medida_${i}`]} />
                                    {errores[`medida_${i}`] && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">DOT</label>
                                    <InputDOT value={d.dot}
                                        onChange={(val, esValido) => setDOT(i, val, esValido)}
                                        error={errores[`dot_${i}`]} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">TIPO *</label>
                                    <select value={d.tipo_reencauche}
                                        onChange={e => setDetalle(i, 'tipo_reencauche', e.target.value)}
                                        className={`w-full h-8 border rounded-lg px-2 text-xs focus:outline-none ${errores[`tipo_reencauche_${i}`] ? 'border-red-400' : 'border-gray-300'}`}>
                                        <option value="">Tipo</option>
                                        {TIPOS_REENCAUCHE.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                    {errores[`tipo_reencauche_${i}`] && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">ESTADO DEL NEUMÁTICO</label>
                                    <select value={d.estado_neumatico}
                                        onChange={e => setDetalle(i, 'estado_neumatico', e.target.value)}
                                        className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs focus:outline-none">
                                        <option value="">Selecciona estado</option>
                                        {['Bueno', 'Regular', 'Desgastado', 'Con daño lateral', 'Con corte'].map(s => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">PRECIO *</label>
                                    <input type="number" min="0" step="0.50" value={d.precio}
                                        onChange={e => setDetalle(i, 'precio', e.target.value)}
                                        placeholder="0.00"
                                        className={`w-full h-8 border rounded-lg px-2 text-xs focus:outline-none ${errores[`precio_${i}`] ? 'border-red-400' : 'border-gray-300'}`} />
                                    {errores[`precio_${i}`] && <p className="text-[10px] text-red-500 mt-0.5">Precio inválido</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Observaciones y cobro */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Observaciones</label>
                    <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)}
                        rows={2} placeholder="Notas adicionales..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                </div>
                <div className="bg-[#1C3F6E] rounded-xl p-3 text-white">
                    <div className="text-xs text-white/60 font-semibold mb-2">Resumen de cobro</div>
                    <div className="flex justify-between text-xs text-white/80 mb-1">
                        <span>Total</span>
                        <span className="font-semibold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/80 mb-2">
                        <span>Abono</span>
                        <input type="number" min="0" max={total} step="0.50"
                            value={form.abono} onChange={e => set('abono', e.target.value)}
                            placeholder="0.00"
                            className={`w-20 h-7 bg-white/10 border rounded-md px-2 text-xs text-white placeholder-white/40 focus:outline-none text-right ${errores.abono ? 'border-red-400' : 'border-white/30'}`} />
                    </div>
                    {errores.abono && <p className="text-[10px] text-red-300 mb-1">{errores.abono}</p>}
                    <div className="flex justify-between text-sm font-bold border-t border-white/20 pt-2">
                        <span>Saldo</span>
                        <span className="text-[#F5C400]">${saldo.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Guardando...' : 'Guardar orden'}
                </button>
            </div>
        </form>
    )
}