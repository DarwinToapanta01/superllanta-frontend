import api from './api'

export const reparacionesService = {
    listar: (params) => api.get('/reparaciones', { params }),
    obtener: (id) => api.get(`/reparaciones/${id}`),
    crear: (data) => api.post('/reparaciones', data),
}