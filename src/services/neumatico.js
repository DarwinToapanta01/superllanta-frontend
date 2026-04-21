import api from './api'

export const neumaticosService = {
    listarTaller: () => api.get('/neumaticos', { params: { tipo: 'taller' } }),
    listarVenta: () => api.get('/neumaticos', { params: { tipo: 'venta' } }),
    obtener: (id) => api.get(`/neumaticos/${id}`),
    registrarTaller: (data) => api.post('/neumaticos/taller', data),
    crearVenta: (data) => api.post('/neumaticos/venta', data),
    registrarVenta: (data) => api.post('/ventas', data),
    obtenerQR: (id) => api.get(`/neumaticos/${id}/qr-imagen`),
    hojaDeVida: (codigo) => api.get(`/qr/${codigo}`),
}