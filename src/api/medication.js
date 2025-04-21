import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000
})

export const getRecords = () => api.get('/records')

export const addRecord = (data) => api.post('/records', data)

export const updateRecord = (id, data) => api.put(`/records/${id}`, data)

export const deleteRecord = (id) => api.delete(`/records/${id}`) 