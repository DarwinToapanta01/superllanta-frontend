import api from './api'

export const vulcanizadosService = {
    listar: (params) => api.get('/vulcanizados', { params }),
    obtener: (id) => api.get(`/vulcanizados/${id}`),
    crear: (data) => api.post('/vulcanizados', data),
    cambiarEstado: (id, estado) => api.patch(`/vulcanizados/${id}/estado`, { estado }),
    registrarAbono: (id, monto) => api.patch(`/vulcanizados/${id}/abono`, { monto }),
}