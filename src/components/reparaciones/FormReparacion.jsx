import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientesService } from '../../services/clientes'
import { productosService } from '../../services/productos'
import InputMedida from '../ui/InputMedida'
import InputDOT from '../ui/InputDOT'

export default function FormReparacion({ onGuardar, cargando, onCancelar }) {
    const [tipo, setTipo] = useState('arreglo')
    const [form, setForm] = useState({
        id_cliente: '', marca_neumatico: '', medida_neumatico: '',
        dot_neumatico: '', dotValido: true, descripcion: '',
        costo: '', observaciones: ''
    })
    const [insumos, setInsumos] = useState([])
    const [cantidadCambios, setCantidadCambios] = useState(1)
    const [precioCambio, setPrecioCambio] = useState('')
    const [errores, setErrores] = useState({})

    const { data: clientes = [] } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => clientesService.listar().then(r => r.data)
    })

    const { data: productos = [] } = useQuery({
        queryKey: ['productos'],
        queryFn: () => productosService.listar({ estado: true }).then(r => r.data)
    })

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrores(e => ({ ...e, [k]: '' })) }

    const agregarInsumo = () => setInsumos(i => [...i, { id_producto: '', cantidad: 1 }])
    const eliminarInsumo = (i) => setInsumos(ins => ins.filter((_, idx) => idx !== i))
    const setInsumo = (i, k, v) => setInsumos(ins => ins.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

    const costoInsumos = insumos.reduce((sum, ins) => {
        const prod = productos.find(p => p.id_producto === parseInt(ins.id_producto))
        return sum + (parseFloat(prod?.precio_venta || 0) * (parseInt(ins.cantidad) || 0))
    }, 0)

    const totalCambio = (parseFloat(precioCambio) || 0) * (parseInt(cantidadCambios) || 0)

    const validar = () => {
        const e = {}
        if (!form.id_cliente) e.id_cliente = 'Selecciona un cliente'
        if (tipo === 'arreglo') {
            if (!form.marca_neumatico) e.marca_neumatico = 'Requerido'
            if (!form.medida_neumatico) e.medida_neumatico = 'Requerido'
            if (form.dot_neumatico && !form.dotValido) e.dot_neumatico = 'DOT inválido'
            if (insumos.length === 0) e.insumos = 'Agrega al menos un insumo'
            insumos.forEach((ins, i) => {
                if (!ins.id_producto) e[`insumo_prod_${i}`] = 'Requerido'
                if (!ins.cantidad || ins.cantidad < 1) e[`insumo_cant_${i}`] = 'Inválido'
            })
        }
        if (tipo === 'cambio') {
            if (!cantidadCambios || parseInt(cantidadCambios) < 1) e.cantidadCambios = 'Ingresa la cantidad de cambios'
            if (!precioCambio || parseFloat(precioCambio) <= 0) e.precioCambio = 'Ingresa el precio por cambio'
        }
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }

        onGuardar({
            id_cliente: parseInt(form.id_cliente),
            tipo_reparacion: tipo,
            // Solo para arreglos
            marca_neumatico: tipo === 'arreglo' ? form.marca_neumatico : null,
            medida_neumatico: tipo === 'arreglo' ? form.medida_neumatico : null,
            dot_neumatico: tipo === 'arreglo' ? (form.dot_neumatico || null) : null,
            descripcion: form.descripcion || null,
            costo: tipo === 'arreglo'
                ? (parseFloat(form.costo) || costoInsumos)
                : totalCambio,
            observaciones: form.observaciones || null,
            insumos: tipo === 'arreglo'
                ? insumos.map(i => ({ id_producto: parseInt(i.id_producto), cantidad: parseInt(i.cantidad) }))
                : [],
            detalles_cambio: tipo === 'cambio' ? [{
                cantidad_cambios: parseInt(cantidadCambios),
                precio_mano_obra: parseFloat(precioCambio),
                // Campos requeridos por el backend pero simplificados
                marca_desmontado: 'N/A', medida_desmontada: 'N/A',
                marca_montado: 'N/A', medida_montada: 'N/A',
                es_neumatico_propio: true,
            }] : []
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Selector tipo */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-2 uppercase tracking-wide">
                    Tipo de servicio *
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setTipo('arreglo')}
                        className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${tipo === 'arreglo' ? 'border-[#1C3F6E] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <span className="text-xl">🔧</span>
                        <span className="text-xs font-semibold text-[#1A2332]">Arreglo</span>
                        <span className="text-[10px] text-gray-500">Parches, moñones, válvulas</span>
                    </button>
                    <button type="button" onClick={() => setTipo('cambio')}
                        className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${tipo === 'cambio' ? 'border-[#E67E22] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <span className="text-xl">🔄</span>
                        <span className="text-xs font-semibold text-[#1A2332]">Cambio de neumático</span>
                        <span className="text-[10px] text-gray-500">Solo mano de obra</span>
                    </button>
                </div>
            </div>

            {/* Cliente */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Cliente *</label>
                <select value={form.id_cliente} onChange={e => set('id_cliente', e.target.value)}
                    className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.id_cliente ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                    <option value="">Selecciona un cliente</option>
                    {clientes.map(c => (
                        <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido || ''}</option>
                    ))}
                </select>
                {errores.id_cliente && <p className="text-[10px] text-red-500 mt-1">{errores.id_cliente}</p>}
            </div>

            {/* ARREGLO: datos del neumático + insumos */}
            {tipo === 'arreglo' && (
                <>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <div className="text-xs font-semibold text-[#1C3F6E] mb-3 uppercase tracking-wide">
                            🔧 Neumático a reparar
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">MARCA *</label>
                                <input value={form.marca_neumatico}
                                    onChange={e => set('marca_neumatico', e.target.value)}
                                    placeholder="Ej: Michelin"
                                    className={`w-full h-8 border rounded-lg px-2 text-xs focus:outline-none ${errores.marca_neumatico ? 'border-red-400' : 'border-gray-300'}`} />
                                {errores.marca_neumatico && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">MEDIDA *</label>
                                <InputMedida value={form.medida_neumatico}
                                    onChange={v => set('medida_neumatico', v)}
                                    error={errores.medida_neumatico} />
                                {errores.medida_neumatico && <p className="text-[10px] text-red-500 mt-0.5">Requerido</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">DOT</label>
                                <InputDOT value={form.dot_neumatico}
                                    onChange={(val, esValido) => { set('dot_neumatico', val); set('dotValido', esValido) }}
                                    error={errores.dot_neumatico} />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">DESCRIPCIÓN DEL DAÑO</label>
                                <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                                    placeholder="Ej: Pinchazo lateral, válvula rota..."
                                    className="w-full h-8 border border-gray-300 rounded-lg px-2 text-xs focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-[#1A2332] uppercase tracking-wide">
                                Insumos utilizados *
                            </label>
                            <button type="button" onClick={agregarInsumo}
                                className="text-xs text-[#2563A8] hover:underline">+ Agregar insumo</button>
                        </div>
                        {errores.insumos && <p className="text-[10px] text-red-500 mb-2">{errores.insumos}</p>}
                        {insumos.length === 0 ? (
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center text-xs text-gray-400">
                                Haz clic en "+ Agregar insumo" para registrar los materiales usados
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {insumos.map((ins, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                                        <select value={ins.id_producto}
                                            onChange={e => setInsumo(i, 'id_producto', e.target.value)}
                                            className={`flex-1 h-8 border rounded-lg px-2 text-xs focus:outline-none ${errores[`insumo_prod_${i}`] ? 'border-red-400' : 'border-gray-300'}`}>
                                            <option value="">Selecciona insumo</option>
                                            {productos.filter(p => p.estado && p.stock > 0).map(p => (
                                                <option key={p.id_producto} value={p.id_producto}>
                                                    {p.nombre} (stock: {p.stock})
                                                </option>
                                            ))}
                                        </select>
                                        <input type="number" min="1" value={ins.cantidad}
                                            onChange={e => setInsumo(i, 'cantidad', e.target.value)}
                                            className={`w-16 h-8 border rounded-lg px-2 text-xs text-center focus:outline-none ${errores[`insumo_cant_${i}`] ? 'border-red-400' : 'border-gray-300'}`} />
                                        <button type="button" onClick={() => eliminarInsumo(i)}
                                            className="text-red-400 hover:text-red-600 text-sm px-1">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {insumos.length > 0 && costoInsumos > 0 && (
                            <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-blue-50 rounded-lg">
                                <span className="text-xs text-[#1C3F6E]">Costo calculado por insumos</span>
                                <span className="text-xs font-bold text-[#1C3F6E]">${costoInsumos.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="mt-2">
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                                COSTO TOTAL <span className="font-normal text-gray-400">(puedes ajustarlo)</span>
                            </label>
                            <input type="number" min="0" step="0.50"
                                value={form.costo || costoInsumos}
                                onChange={e => set('costo', e.target.value)}
                                placeholder={costoInsumos.toFixed(2)}
                                className="w-32 h-8 border border-gray-300 rounded-lg px-2 text-xs focus:outline-none" />
                        </div>
                    </div>
                </>
            )}

            {/* CAMBIO: cantidad y precio simplificado */}
            {tipo === 'cambio' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="text-xs font-semibold text-orange-700 mb-4 uppercase tracking-wide">
                        🔄 Detalle del cambio
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                                Cantidad de cambios *
                            </label>
                            <input
                                type="number" min="1" max="20"
                                value={cantidadCambios}
                                onChange={e => { setCantidadCambios(e.target.value); setErrores(er => ({ ...er, cantidadCambios: '' })) }}
                                className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.cantidadCambios ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
                            />
                            {errores.cantidadCambios && <p className="text-[10px] text-red-500 mt-1">{errores.cantidadCambios}</p>}
                            <p className="text-[10px] text-gray-500 mt-1">Número de neumáticos a cambiar</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                                Precio por cambio *
                            </label>
                            <input
                                type="number" min="0" step="0.50"
                                value={precioCambio}
                                onChange={e => { setPrecioCambio(e.target.value); setErrores(er => ({ ...er, precioCambio: '' })) }}
                                placeholder="0.00"
                                className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.precioCambio ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
                            />
                            {errores.precioCambio && <p className="text-[10px] text-red-500 mt-1">{errores.precioCambio}</p>}
                            <p className="text-[10px] text-gray-500 mt-1">Mano de obra por unidad</p>
                        </div>
                    </div>

                    {/* Total calculado automático */}
                    {cantidadCambios > 0 && precioCambio > 0 && (
                        <div className="mt-4 flex items-center justify-between bg-[#1C3F6E] rounded-lg px-4 py-3 text-white">
                            <span className="text-xs text-white/70">
                                {cantidadCambios} cambio{cantidadCambios > 1 ? 's' : ''} × ${parseFloat(precioCambio).toFixed(2)}
                            </span>
                            <span className="text-base font-bold text-[#F5C400]">
                                Total: ${totalCambio.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Observaciones */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Observaciones</label>
                <input value={form.observaciones} onChange={e => set('observaciones', e.target.value)}
                    placeholder="Notas adicionales..."
                    className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Guardando...' : 'Registrar'}
                </button>
            </div>
        </form>
    )
}