import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usuariosService } from '../../services/usuarios'
import { Eye, EyeOff, Shield, UserCog, CheckCircle, XCircle } from 'lucide-react'

const PERMISOS = {
    administrador: [
        { label: 'Registrar servicios', valor: true },
        { label: 'Ver inventario', valor: true },
        { label: 'Gestionar clientes', valor: true },
        { label: 'Gestionar usuarios', valor: true },
        { label: 'Ver reportes', valor: true },
        { label: 'Configuración del sistema', valor: true },
    ],
    tecnico: [
        { label: 'Registrar servicios', valor: true },
        { label: 'Ver inventario', valor: true },
        { label: 'Gestionar clientes', valor: true },
        { label: 'Gestionar usuarios', valor: false },
        { label: 'Ver reportes', valor: false },
        { label: 'Configuración del sistema', valor: false },
    ],
}

export default function FormUsuario({ usuario, onGuardar, cargando, onCancelar }) {
    const [form, setForm] = useState({
        nombre: '', apellido: '', correo: '',
        contrasena: '', id_rol: '', estado: true
    })
    const [mostrarPass, setMostrarPass] = useState(false)
    const [errores, setErrores] = useState({})

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => usuariosService.listarRoles().then(r => r.data)
    })

    useEffect(() => {
        if (usuario) setForm({
            nombre: usuario.nombre || '',
            apellido: usuario.apellido || '',
            correo: usuario.correo || '',
            contrasena: '',
            id_rol: usuario.id_rol || '',
            estado: usuario.estado ?? true
        })
    }, [usuario])

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }))
        setErrores(e => ({ ...e, [k]: '' }))
    }

    const rolSeleccionado = roles.find(r => r.id_rol === parseInt(form.id_rol))
    const permisos = PERMISOS[rolSeleccionado?.nombre] || []
    const iniciales = `${form.nombre?.[0] || ''}${form.apellido?.[0] || ''}`.toUpperCase()

    const validar = () => {
        const e = {}
        if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
        if (!form.correo.trim()) e.correo = 'El correo es requerido'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido'
        if (!form.id_rol) e.id_rol = 'Selecciona un rol'
        if (!usuario && !form.contrasena) e.contrasena = 'La contraseña es requerida'
        if (form.contrasena && form.contrasena.length < 8) e.contrasena = 'Mínimo 8 caracteres'
        return e
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const e2 = validar()
        if (Object.keys(e2).length > 0) { setErrores(e2); return }
        const data = { ...form, id_rol: parseInt(form.id_rol) }
        if (!data.contrasena) delete data.contrasena
        onGuardar(data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vista previa del usuario */}
            {form.nombre && (
                <div className="bg-[#1C3F6E] rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5C400] flex items-center justify-center text-sm font-bold text-[#1C3F6E] flex-shrink-0">
                        {iniciales || '?'}
                    </div>
                    <div>
                        <div className="text-white text-sm font-semibold">
                            {form.nombre} {form.apellido}
                        </div>
                        {form.correo && <div className="text-white/50 text-xs">{form.correo}</div>}
                    </div>
                    {rolSeleccionado && (
                        <span className="ml-auto text-[10px] bg-white/10 text-white px-2 py-1 rounded-full capitalize">
                            {rolSeleccionado.nombre}
                        </span>
                    )}
                </div>
            )}

            {/* Datos personales */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Nombre *
                    </label>
                    <input value={form.nombre} onChange={e => set('nombre', e.target.value)} maxLength={100}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errores.nombre && <p className="text-[10px] text-red-500 mt-1">{errores.nombre}</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Apellido
                    </label>
                    <input value={form.apellido} onChange={e => set('apellido', e.target.value)} maxLength={100}
                        className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8]" />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Correo electrónico *
                    </label>
                    <input type="email" value={form.correo} onChange={e => set('correo', e.target.value)}
                        className={`w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:border-[#2563A8] ${errores.correo ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {errores.correo && <p className="text-[10px] text-red-500 mt-1">{errores.correo}</p>}
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#1A2332] mb-1 uppercase tracking-wide">
                        Contraseña {usuario ? '(dejar vacío para no cambiar)' : '*'}
                    </label>
                    <div className="relative">
                        <input
                            type={mostrarPass ? 'text' : 'password'}
                            value={form.contrasena}
                            onChange={e => set('contrasena', e.target.value)}
                            placeholder={usuario ? 'Nueva contraseña (opcional)' : 'Mínimo 8 caracteres'}
                            className={`w-full h-9 border rounded-lg px-3 pr-10 text-sm focus:outline-none focus:border-[#2563A8] ${errores.contrasena ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                        <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {mostrarPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                    {errores.contrasena && <p className="text-[10px] text-red-500 mt-1">{errores.contrasena}</p>}
                </div>
            </div>

            {/* Selector de rol */}
            <div>
                <label className="block text-xs font-semibold text-[#1A2332] mb-2 uppercase tracking-wide">
                    Rol del usuario *
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {roles.map(r => (
                        <button key={r.id_rol} type="button"
                            onClick={() => set('id_rol', String(r.id_rol))}
                            className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${parseInt(form.id_rol) === r.id_rol
                                ? r.nombre === 'administrador'
                                    ? 'border-[#1C3F6E] bg-blue-50'
                                    : 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}>
                            {r.nombre === 'administrador'
                                ? <Shield size={18} className={parseInt(form.id_rol) === r.id_rol ? 'text-[#1C3F6E]' : 'text-gray-400'} />
                                : <UserCog size={18} className={parseInt(form.id_rol) === r.id_rol ? 'text-green-600' : 'text-gray-400'} />
                            }
                            <span className="text-xs font-semibold text-[#1A2332] capitalize">{r.nombre}</span>
                        </button>
                    ))}
                </div>
                {errores.id_rol && <p className="text-[10px] text-red-500 mt-1">{errores.id_rol}</p>}
            </div>

            {/* Permisos del rol */}
            {permisos.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="text-xs font-semibold text-[#1A2332] mb-2 capitalize">
                        <span>Permisos — {rolSeleccionado?.nombre}</span>
                    </div>
                    <div className="space-y-1">
                        {permisos.map(({ label, valor }) => (
                            <div key={label} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                                <span className="text-xs text-gray-600">{label}</span>
                                <div className="flex items-center gap-1">
                                    {valor ? (
                                        <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                            <CheckCircle size={11} />
                                            <span>Sí</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium">
                                            <XCircle size={11} />
                                            <span>No</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estado — solo al editar */}
            {usuario && (
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="estadoCheck" checked={form.estado}
                        onChange={e => set('estado', e.target.checked)}
                        className="w-4 h-4 accent-[#1C3F6E]" />
                    <label htmlFor="estadoCheck" className="text-sm text-[#1A2332]">
                        Usuario activo
                    </label>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancelar}
                    className="h-9 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={cargando}
                    className="h-9 px-5 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                    {cargando ? 'Guardando...' : 'Guardar usuario'}
                </button>
            </div>
        </form>
    )
}