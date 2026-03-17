import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const getPurchaseRecords = () => api.get('/purchase-records')

export const addPurchaseRecord = (data) => api.post('/purchase-records', data)

export const updatePurchaseRecord = (id, data) => api.put(`/purchase-records/${id}`, data)

export const deletePurchaseRecord = (id) => api.delete(`/purchase-records/${id}`)

export const batchDeletePurchaseRecords = (ids) => api.delete('/purchase-records/batch', { data: { ids } })

export const getPurchaseStats = () => api.get('/purchase-stats/overview')
