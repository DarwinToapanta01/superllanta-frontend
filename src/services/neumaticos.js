import api from './api'

export const neumaticosService = {
    listarTaller: () => api.get('/neumaticos', { params: { tipo: 'taller' } }),
    obtener: (id) => api.get(`/neumaticos/${id}`),
    registrarTaller: (data) => api.post('/neumaticos/taller', data),
    obtenerQR: (id) => api.get(`/neumaticos/${id}/qr-imagen`),
    hojaDeVida: (codigo) => api.get(`/qr/${codigo}`),
}