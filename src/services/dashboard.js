import api from './api'

export const dashboardService = {
    obtener: () => api.get('/dashboard'),
    tendencias: (dias = 30) => api.get(`/dashboard/tendencias?dias=${dias}`)
}