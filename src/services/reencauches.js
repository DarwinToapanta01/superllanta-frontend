import api from './api'

export const reencauchesService = {
    listar: (params) => api.get('/reencauches', { params }),
    obtener: (id) => api.get(`/reencauches/${id}`),
    porCliente: (clienteId) => api.get(`/reencauches/cliente/${clienteId}`),
    crear: (data) => api.post('/reencauches', data),
    cambiarEstado: (id, estado) => api.patch(`/reencauches/${id}/estado`, { estado }),
}