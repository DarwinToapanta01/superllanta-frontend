import { useState, useEffect } from 'react'
import { User, Building2 } from 'lucide-react'

const CIUDADES_ECUADOR = [
    'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala',
    'Durán', 'Manta', 'Portoviejo', 'Loja', 'Ambato', 'Esmeraldas',
    'Quevedo', 'Riobamba', 'Ibarra', 'Milagro', 'Latacunga',
    'Babahoyo', 'Sangolquí', 'Tulcán', 'Azogues', 'Nueva Loja',
    'Guaranda', 'Puyo', 'Macas', 'Tena', 'Zamora', 'Cayambe',
    'Otavalo', 'Salinas', 'La Libertad', 'Ventanas', 'Pasaje',
    'Santa Rosa', 'Huaquillas', 'Chone', 'Bahía de Caráquez',
]

const validarCedula = (cedula) => {
    if (!/^\d{10}$/.test(cedula)) return false
    const provincia = parseInt(cedula.substring(0, 2))
    if (provincia < 1 || provincia > 24) return false
    const digitos = cedula.split('').map(Number)
    const verificador = digitos[9]
    let suma = 0
    for (let i = 0; i < 9; i++) {
        let val = digitos[i] * (i % 2 === 0 ? 2 : 1)
        if (val > 9) val -= 9
        suma += val
    }
    const residuo = suma % 10
    const digitoCalculado = residuo === 0 ? 0 : 10 - residuo
    return digitoCalculado === verificador
}

const validarRUC = (ruc) => {
    if (!/^\d{13}$/.test(ruc)) return false
    const tipo = parseInt(ruc.substring(2, 3))
    if (tipo > 6) return false
    return ruc.endsWith('001')
}

const validarTelefono = (tel) => {
    const limpio = tel.replace(/[\s\-]/g, '')
    return /^(09\d{8}|0[2-7]\d{7})$/.test(limpio)
}

export default function FormCliente({ cliente, onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({
        tipo_cliente: 'individual',
        nombre_empresa: '',
        nombre: '', apellido: '', telefono: '', cedula: '', ciudad: '', direccion: ''
    })
    const [errores, setErrores] = useState({})
    const [tipoCedula, setTipoCedula] = useState('cedula')

    useEffect(() => {
        if (cliente) {
            const esRuc = cliente.cedula?.length === 13
            setTipoCedula(esRuc ? 'ruc' : 'cedula')
            setForm({
                tipo_cliente: cliente.tipo_cliente || 'individual',
                nombre_empresa: cliente.nombre_empresa || '',
                nombre: cliente.nombre || '',
                apellido: cliente.apellido || '',
                telefono: cliente.telefono || '',
                cedula: cliente.cedula || '',
                ciudad: cliente.direccion?.split(',')[0]?.trim() || '',
                direccion: cliente.direccion || '',
            })
        }
    }, [cliente])

    const set = (campo, valor) => {
        setForm(f => ({ ...f, [campo]: valor }))
        setErrores(e => ({ ...e, [campo]: '' }))
    }

    const validar = () => {
        const e = {}

        if (form.tipo_cliente === 'empresa' && !form.nombre_empresa.trim()) {
            e.nombre_empresa = 'El nombre de la empresa es requerido'
        }

        if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
        else if (form.nombre.trim().length < 2) e.nombre = 'Mínimo 2 caracteres'
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre)) e.nombre = 'Solo se permiten letras'

        if (form.apellido && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.apellido))
            e.apellido = 'Solo se permiten letras'

        if (form.cedula) {
            if (tipoCedula === 'cedula') {
                if (!validarCedula(form.cedula))
                    e.cedula = 'Cédula inválida. Debe tener 10 dígitos válidos'
            } else {
                if (!validarRUC(form.cedula))
                    e.cedula = 'RUC inválido. Debe tener 13 dígitos y terminar en 001'
            }
        }

        if (form.telefono && !validarTelefono(form.telefono))
            e.telefono = 'Teléfono inválido. Ej: 0991234567 (celular) o 022345678 (convencional)'

        if (!form.ciudad) e.ciudad = 'Selecciona una ciudad'

        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }
        const direccionCompleta = form.direccion
            ? `${form.ciudad}, ${form.direccion}`
            : form.ciudad
        onGuardar({
            tipo_cliente: form.tipo_cliente,
            nombre_empresa: form.tipo_cliente === 'empresa' ? form.nombre_empresa.trim() : null,
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim() || null,
            telefono: form.telefono || null,
            cedula: form.cedula || null,
            direccion: direccionCompleta,
        })
    }

    const iniciales = `${form.nombre?.[0] || ''}${form.apellido?.[0] || ''}`.toUpperCase()

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── NUEVO: Selector tipo de cliente ── */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-2 uppercase tracking-wide">
                    Tipo de cliente *
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => set('tipo_cliente', 'individual')}
                        className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${form.tipo_cliente === 'individual'
                                ? 'border-[#1C3F6E] bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                        <User size={18} className={form.tipo_cliente === 'individual' ? 'text-[#1C3F6E]' : 'text-gray-400'} />
                        <span className="text-xs font-semibold text-[#1A2332]">Cliente individual</span>
                        <span className="text-[10px] text-gray-500">Vehículo propio</span>
                    </button>
                    <button type="button" onClick={() => set('tipo_cliente', 'empresa')}
                        className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${form.tipo_cliente === 'empresa'
                                ? 'border-[#E67E22] bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                        <Building2 size={18} className={form.tipo_cliente === 'empresa' ? 'text-[#E67E22]' : 'text-gray-400'} />
                        <span className="text-xs font-semibold text-[#1A2332]">Empresa / Flota</span>
                        <span className="text-[10px] text-gray-500">Múltiples vehículos</span>
                    </button>
                </div>
            </div>

            {/* ── NUEVO: Nombre empresa — solo si es empresa ── */}
            {form.tipo_cliente === 'empresa' && (
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Nombre de la empresa *
                    </label>
                    <input value={form.nombre_empresa}
                        onChange={e => set('nombre_empresa', e.target.value)}
                        placeholder="Ej: Transportes El Dorado S.A."
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.nombre_empresa ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errores.nombre_empresa && <p className="text-[10px] text-red-500 mt-1">{errores.nombre_empresa}</p>}
                </div>
            )}

            {/* Vista previa */}
            {form.nombre && (
                <div className="bg-[#1C3F6E] rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F5C400] flex items-center justify-center text-sm font-bold text-[#1C3F6E]">
                        {iniciales}
                    </div>
                    <div>
                        <div className="text-white text-sm font-semibold">
                            {form.tipo_cliente === 'empresa' && form.nombre_empresa
                                ? <span>{form.nombre_empresa}</span>
                                : <span>{form.nombre} {form.apellido}</span>
                            }
                        </div>
                        {form.cedula && (
                            <div className="text-white/50 text-xs">
                                {tipoCedula === 'ruc' ? 'RUC' : 'CI'}: {form.cedula}
                            </div>
                        )}
                    </div>
                    {form.tipo_cliente === 'empresa' && (
                        <span className="ml-auto text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                            Empresa
                        </span>
                    )}
                </div>
            )}

            {/* Datos del contacto — igual que antes */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        {form.tipo_cliente === 'empresa' ? 'Nombre contacto *' : 'Nombre *'}
                    </label>
                    <input value={form.nombre} onChange={e => set('nombre', e.target.value)} maxLength={100}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errores.nombre && <p className="text-[10px] text-red-500 mt-1">{errores.nombre}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Apellido</label>
                    <input value={form.apellido} onChange={e => set('apellido', e.target.value)} maxLength={100}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.apellido ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errores.apellido && <p className="text-[10px] text-red-500 mt-1">{errores.apellido}</p>}
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Identificación</label>
                    <div className="flex gap-2">
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                            <button type="button" onClick={() => { setTipoCedula('cedula'); set('cedula', '') }}
                                className={`px-3 h-9 text-xs font-medium transition-colors ${tipoCedula === 'cedula' ? 'bg-[#1C3F6E] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                                Cédula
                            </button>
                            <button type="button" onClick={() => { setTipoCedula('ruc'); set('cedula', '') }}
                                className={`px-3 h-9 text-xs font-medium transition-colors ${tipoCedula === 'ruc' ? 'bg-[#1C3F6E] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                                RUC
                            </button>
                        </div>
                        <div className="flex-1">
                            <input
                                value={form.cedula}
                                onChange={e => set('cedula', e.target.value.replace(/\D/g, '').slice(0, tipoCedula === 'ruc' ? 13 : 10))}
                                placeholder={tipoCedula === 'cedula' ? '10 dígitos' : '13 dígitos'}
                                maxLength={tipoCedula === 'ruc' ? 13 : 10}
                                className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.cedula ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            />
                        </div>
                    </div>
                    {errores.cedula
                        ? <p className="text-[10px] text-red-500 mt-1">{errores.cedula}</p>
                        : <p className="text-[10px] text-gray-400 mt-1">{tipoCedula === 'cedula' ? 'Cédula ecuatoriana de 10 dígitos' : 'RUC ecuatoriano de 13 dígitos'}</p>
                    }
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Teléfono</label>
                    <input
                        value={form.telefono}
                        onChange={e => set('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Ej: 0991234567"
                        maxLength={10}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.telefono ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errores.telefono
                        ? <p className="text-[10px] text-red-500 mt-1">{errores.telefono}</p>
                        : <p className="text-[10px] text-gray-400 mt-1">Celular (09...) o convencional (02...)</p>
                    }
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">Ciudad *</label>
                    <select value={form.ciudad} onChange={e => set('ciudad', e.target.value)}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.ciudad ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                        <option value="">Selecciona una ciudad</option>
                        {CIUDADES_ECUADOR.sort().map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errores.ciudad && <p className="text-[10px] text-red-500 mt-1">{errores.ciudad}</p>}
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Dirección <span className="text-gray-400 normal-case font-normal">(barrio, calle - opcional)</span>
                    </label>
                    <input value={form.direccion} onChange={e => set('direccion', e.target.value)}
                        placeholder="Ej: Barrio El Recreo, Av. Principal"
                        maxLength={200}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Guardando...' : 'Guardar cliente'}
                </button>
            </div>
        </form>
    )
}