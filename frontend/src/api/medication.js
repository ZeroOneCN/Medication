import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000
})

export const getRecords = () => api.get('/records')

export const addRecord = (data) => api.post('/records', data)

export const updateRecord = (id, data) => api.put(`/records/${id}`, data)

export const deleteRecord = (id) => api.delete(`/records/${id}`)

export const getDailySummaries = (params) => api.get('/daily-summaries', { params })

export const saveDailySummary = (date, summary) => api.put(`/daily-summaries/${date}`, { summary })
