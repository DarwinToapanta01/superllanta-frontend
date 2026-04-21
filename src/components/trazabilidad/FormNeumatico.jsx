import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientesService } from '../../services/clientes'
import InputMedida from '../ui/InputMedida'
import InputDOT from '../ui/InputDOT'
import { Info } from 'lucide-react'

export default function FormNeumatico({ onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({
        id_cliente: '', marca: '', medida: '', dot: '', dotValido: true,
        estado: 'activo', observaciones: ''
    })
    const [errores, setErrores] = useState({})

    const { data: clientes = [] } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => clientesService.listar().then(r => r.data)
    })

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrores(e => ({ ...e, [k]: '' })) }

    const validar = () => {
        const e = {}
        if (!form.id_cliente) e.id_cliente = 'Selecciona un cliente'
        if (!form.marca.trim()) e.marca = 'La marca es requerida'
        if (!form.medida) e.medida = 'La medida es requerida'
        if (form.dot && !form.dotValido) e.dot = 'DOT inválido'
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }
        onGuardar({
            id_cliente: parseInt(form.id_cliente),
            marca: form.marca.trim(),
            medida: form.medida,
            dot: form.dot || null,
            estado: form.estado,
            observaciones: form.observaciones || null,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                Al registrar el neumático se generará automáticamente un código QR único que podrás imprimir y adherir a la llanta.
            </div>

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

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Marca *</label>
                    <input value={form.marca} onChange={e => set('marca', e.target.value)}
                        placeholder="Ej: Michelin"
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.marca ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errores.marca && <p className="text-[10px] text-red-500 mt-1">{errores.marca}</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Medida *</label>
                    <InputMedida value={form.medida} onChange={v => set('medida', v)} error={errores.medida} />
                    {errores.medida && <p className="text-[10px] text-red-500 mt-1">{errores.medida}</p>}
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
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Estado inicial</label>
                    <select value={form.estado} onChange={e => set('estado', e.target.value)}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none">
                        <option value="activo">Activo — bueno</option>
                        <option value="en_servicio">En servicio</option>
                        <option value="dañado">Dañado</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Observaciones</label>
                    <input value={form.observaciones} onChange={e => set('observaciones', e.target.value)}
                        placeholder="Notas del estado inicial..."
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none" />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Generando QR...' : 'Registrar y generar QR'}
                </button>
            </div>
        </form>
    )
}