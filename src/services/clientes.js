import api from './api'

export const clientesService = {
    listar: (params) => api.get('/clientes', { params }),
    obtener: (id) => api.get(`/clientes/${id}`),
    crear: (data) => api.post('/clientes', data),
    actualizar: (id, data) => api.put(`/clientes/${id}`, data),
    neumaticos: (id) => api.get(`/clientes/${id}/neumaticos`),
}