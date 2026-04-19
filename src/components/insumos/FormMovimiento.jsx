import { useState } from 'react'

export default function FormMovimiento({ producto, onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({ tipo: 'entrada', cantidad: 1, motivo: '' })
    const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

    const handleSubmit = (e) => {
        e.preventDefault()
        onGuardar({ ...form, cantidad: parseInt(form.cantidad) })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {producto && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
                    <span className="font-semibold text-[#1C3F6E]">{producto.nombre}</span>
                    <span className="text-gray-500 ml-2">Stock actual: <strong>{producto.stock}</strong> {producto.unidad_medida}</span>
                </div>
            )}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Tipo de movimiento *</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { val: 'entrada', label: '↑ Entrada', color: 'border-green-400 bg-green-50 text-green-700' },
                        { val: 'salida', label: '↓ Salida', color: 'border-red-400 bg-red-50 text-red-700' },
                        { val: 'ajuste', label: '⚡ Ajuste', color: 'border-orange-400 bg-orange-50 text-orange-700' },
                    ].map(({ val, label, color }) => (
                        <button key={val} type="button" onClick={() => set('tipo', val)}
                            className={`h-9 border-2 rounded-lg text-xs font-semibold transition-all ${form.tipo === val ? color : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                    {form.tipo === 'ajuste' ? 'Nuevo stock' : 'Cantidad'}
                </label>
                <input type="number" min="1" value={form.cantidad} onChange={e => set('cantidad', e.target.value)} required
                    className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
            </div>
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Motivo</label>
                <input value={form.motivo} onChange={e => set('motivo', e.target.value)}
                    placeholder="Ej: Compra a proveedor, Uso en reparación..."
                    className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Registrando...' : 'Registrar movimiento'}
                </button>
            </div>
        </form>
    )
}