import api from './api'

export const productosService = {
    listar: (params) => api.get('/productos', { params }),
    obtener: (id) => api.get(`/productos/${id}`),
    crear: (data) => api.post('/productos', data),
    actualizar: (id, data) => api.put(`/productos/${id}`, data),
    registrarMovimiento: (id, data) => api.post(`/productos/${id}/movimiento`, data),
    historialMovimientos: (id) => api.get(`/productos/${id}/movimientos`),
    alertas: () => api.get('/productos/alertas'),
    categorias: () => api.get('/categorias'),
}