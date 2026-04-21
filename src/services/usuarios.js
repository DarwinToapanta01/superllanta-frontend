import api from './api'

export const usuariosService = {
    listar: () => api.get('/usuarios'),
    listarRoles: () => api.get('/roles'),
    crear: (data) => api.post('/usuarios', data),
    actualizar: (id, data) => api.put(`/usuarios/${id}`, data),
    desactivar: (id) => api.patch(`/usuarios/${id}/desactivar`),
}