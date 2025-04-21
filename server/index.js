const express = require('express')
const cors = require('cors')
const pool = require('./config/db')

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// 获取所有记录
app.get('/api/records', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medication_records ORDER BY date DESC')
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '获取记录失败' })
  }
})

// 添加记录
app.post('/api/records', async (req, res) => {
  const { date, medicineName, breakfast, lunch, dinner } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO medication_records (date, medicine_name, breakfast, lunch, dinner) VALUES (?, ?, ?, ?, ?)',
      [date, medicineName, breakfast, lunch, dinner]
    )
    res.json({ id: result.insertId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '添加记录失败' })
  }
})

// 更新记录
app.put('/api/records/:id', async (req, res) => {
  const { id } = req.params
  const { date, medicineName, breakfast, lunch, dinner } = req.body
  try {
    await pool.query(
      'UPDATE medication_records SET date = ?, medicine_name = ?, breakfast = ?, lunch = ?, dinner = ? WHERE id = ?',
      [date, medicineName, breakfast, lunch, dinner, id]
    )
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '更新记录失败' })
  }
})

// 删除记录
app.delete('/api/records/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM medication_records WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '删除记录失败' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
}) 