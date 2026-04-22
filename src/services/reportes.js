import api from './api'

export const reportesService = {
    servicios: (params) => api.get('/reportes/servicios', { params }),
    insumos: (params) => api.get('/reportes/insumos', { params }),
}