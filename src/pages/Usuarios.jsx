import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuariosService } from '../services/usuarios'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import Spinner from '../components/ui/Spinner'
import useToast from '../hooks/useToast'
import FormUsuario from '../components/usuarios/FormUsuario'
import { UserCog, Shield, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Usuarios() {
    const { esAdmin } = useAuth()

    if (!esAdmin) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield size={20} className="text-red-500" />
                </div>
                <p className="text-sm font-semibold text-[#1A2332] mb-1">Acceso restringido</p>
                <p className="text-xs text-gray-500">Solo los administradores pueden gestionar usuarios.</p>
            </div>
        )
    }
    const queryClient = useQueryClient()
    const { toast, mostrar, cerrar } = useToast()
    const [modalForm, setModalForm] = useState(false)
    const [modalConfirm, setModalConfirm] = useState(false)
    const [seleccionado, setSeleccionado] = useState(null)

    const { data: usuarios = [], isLoading } = useQuery({
        queryKey: ['usuarios'],
        queryFn: () => usuariosService.listar().then(r => r.data)
    })

    const mutacionCrear = useMutation({
        mutationFn: (data) => seleccionado
            ? usuariosService.actualizar(seleccionado.id_usuario, data)
            : usuariosService.crear(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios'])
            setModalForm(false)
            setSeleccionado(null)
            mostrar(seleccionado ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente')
        },
        onError: (err) => mostrar(err.response?.data?.error || 'Error al guardar', 'error')
    })

    const mutacionDesactivar = useMutation({
        mutationFn: (id) => usuariosService.desactivar(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios'])
            setModalConfirm(false)
            setSeleccionado(null)
            mostrar('Usuario desactivado correctamente')
        },
        onError: () => mostrar('Error al desactivar usuario', 'error')
    })

    const abrirEditar = (u) => { setSeleccionado(u); setModalForm(true) }
    const abrirConfirm = (u) => { setSeleccionado(u); setModalConfirm(true) }
    const abrirNuevo = () => { setSeleccionado(null); setModalForm(true) }

    const activos = usuarios.filter(u => u.estado).length
    const inactivos = usuarios.filter(u => !u.estado).length

    const rolColor = (rol) => {
        if (rol === 'administrador') return 'bg-blue-50 text-blue-700 border-blue-200'
        return 'bg-green-50 text-green-700 border-green-200'
    }

    const iniciales = (u) =>
        `${u.nombre?.[0] || ''}${u.apellido?.[0] || ''}`.toUpperCase()

    return (
        <div>
            {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { num: usuarios.length, label: 'Usuarios totales', color: '#1C3F6E' },
                    { num: activos, label: 'Activos', color: '#27AE60' },
                    { num: inactivos, label: 'Inactivos', color: '#9ca3af' },
                ].map(({ num, label, color }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold" style={{ color }}>{num}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex justify-end mb-4">
                <button onClick={abrirNuevo}
                    className="h-9 bg-[#1C3F6E] hover:bg-[#2563A8] text-white text-sm font-semibold px-4 rounded-lg transition-colors flex items-center gap-2">
                    <UserCog size={14} />
                    Nuevo usuario
                </button>
            </div>

            {/* Grid de tarjetas */}
            {isLoading ? <Spinner /> : (
                <div className="grid grid-cols-3 gap-4">
                    {usuarios.map(u => (
                        <div key={u.id_usuario}
                            className={`bg-white border rounded-xl p-4 transition-colors ${u.estado ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                            {/* Avatar e info */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${u.rol?.nombre === 'administrador'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {iniciales(u)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-[#1A2332] truncate">
                                        {u.nombre} {u.apellido || ''}
                                    </div>
                                    <div className="text-[10px] text-gray-500 truncate">{u.correo}</div>
                                </div>
                            </div>

                            {/* Rol y estado */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${rolColor(u.rol?.nombre)}`}>
                                    {u.rol?.nombre === 'administrador'
                                        ? <span className="flex items-center gap-1"><Shield size={9} /><span>Administrador</span></span>
                                        : <span className="flex items-center gap-1"><UserCog size={9} /><span>Técnico</span></span>
                                    }
                                </span>
                                <span className={`flex items-center gap-1 text-[10px] font-medium ${u.estado ? 'text-green-600' : 'text-gray-400'}`}>
                                    {u.estado
                                        ? <span className="flex items-center gap-1"><CheckCircle size={11} /><span>Activo</span></span>
                                        : <span className="flex items-center gap-1"><XCircle size={11} /><span>Inactivo</span></span>
                                    }
                                </span>
                            </div>

                            {/* Fecha creación */}
                            <div className="text-[10px] text-gray-400 mb-3">
                                Creado: {new Date(u.fecha_creacion).toLocaleDateString('es-EC')}
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-2 border-t border-gray-100 pt-3">
                                <button onClick={() => abrirEditar(u)}
                                    className="flex-1 h-7 border border-gray-200 rounded-lg text-xs text-[#1C3F6E] hover:bg-blue-50 transition-colors">
                                    Editar
                                </button>
                                {u.estado && (
                                    <button onClick={() => abrirConfirm(u)}
                                        className="flex-1 h-7 border border-red-200 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors">
                                        Desactivar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal formulario */}
            <Modal
                abierto={modalForm}
                onCerrar={() => { setModalForm(false); setSeleccionado(null) }}
                titulo={seleccionado ? 'Editar usuario' : 'Nuevo usuario'}
                ancho="max-w-lg"
            >
                <FormUsuario
                    usuario={seleccionado}
                    onGuardar={(data) => mutacionCrear.mutate(data)}
                    cargando={mutacionCrear.isPending}
                    onCancelar={() => { setModalForm(false); setSeleccionado(null) }}
                />
            </Modal>

            {/* Modal confirmación desactivar */}
            <Modal
                abierto={modalConfirm}
                onCerrar={() => { setModalConfirm(false); setSeleccionado(null) }}
                titulo="Desactivar usuario"
                ancho="max-w-sm"
            >
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <XCircle size={24} className="text-orange-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#1A2332]">
                            {String(`¿Desactivar a ${seleccionado?.nombre} ${seleccionado?.apellido || ''}?`)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            El usuario no podrá iniciar sesión. Puedes reactivarlo editando su cuenta.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setModalConfirm(false); setSeleccionado(null) }}
                            className="flex-1 h-9 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button
                            onClick={() => mutacionDesactivar.mutate(seleccionado?.id_usuario)}
                            disabled={mutacionDesactivar.isPending}
                            className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                            {mutacionDesactivar.isPending ? 'Desactivando...' : 'Sí, desactivar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}