const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 9500

const createPool = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    })

    await connection.query('CREATE DATABASE IF NOT EXISTS medication_db')
    await connection.query('USE medication_db')

    const initSqlPath = path.join(__dirname, 'config', 'init.sql')
    const initSql = fs.readFileSync(initSqlPath, 'utf8')
    
    const sqlStatements = initSql.split(';').filter(stmt => stmt.trim())
    for (const stmt of sqlStatements) {
      if (stmt.trim()) {
        await connection.query(stmt + ';')
      }
    }

    await connection.end()

    return mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'medication_db',
      waitForConnections: true,
      connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
      queueLimit: process.env.DB_QUEUE_LIMIT || 0
    })
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

let pool

const initializeApp = async () => {
  try {
    pool = await createPool()
    console.log('数据库初始化成功')
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`数据库启动在:`)
      console.log(`  - Local:   http://localhost:${port}`)
      console.log(`  - Network: http://<your-local-ip>:${port}`)
    })
  } catch (error) {
    console.error('应用启动失败:', error)
    process.exit(1)
  }
}

app.use(cors())
app.use(express.json())

app.get('/api/daily-summaries', async (req, res) => {
  try {
    const { start, end } = req.query
    if (start && end) {
      const [rows] = await pool.query(
        'SELECT * FROM medication_daily_summaries WHERE date >= ? AND date <= ? ORDER BY date DESC',
        [start, end]
      )
      res.json(rows)
      return
    }

    const [rows] = await pool.query('SELECT * FROM medication_daily_summaries ORDER BY date DESC')
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '获取总结失败' })
  }
})

app.put('/api/daily-summaries/:date', async (req, res) => {
  const { date } = req.params
  const { summary } = req.body || {}

  if (!date) {
    res.status(400).json({ error: 'date 不能为空' })
    return
  }

  if (typeof summary !== 'string') {
    res.status(400).json({ error: 'summary 必须为字符串' })
    return
  }

  try {
    await pool.query(
      'INSERT INTO medication_daily_summaries (date, summary) VALUES (?, ?) ON DUPLICATE KEY UPDATE summary = VALUES(summary), updated_at = CURRENT_TIMESTAMP',
      [date, summary]
    )
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '保存总结失败' })
  }
})

app.get('/api/records', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medication_records ORDER BY date DESC')
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '获取记录失败' })
  }
})

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

app.delete('/api/records/batch', async (req, res) => {
  const { ids } = req.body
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids 不能为空' })
    return
  }
  try {
    const placeholders = ids.map(() => '?').join(',')
    await pool.query(`DELETE FROM medication_records WHERE id IN (${placeholders})`, ids)
    res.json({ success: true, deletedCount: ids.length })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '批量删除失败' })
  }
})

app.get('/api/stats/overview', async (req, res) => {
  try {
    const [records] = await pool.query('SELECT * FROM medication_records')

    const totalRecords = records.length
    const totalDosage = records.reduce((sum, r) => sum + r.breakfast + r.lunch + r.dinner, 0)

    const dates = [...new Set(records.map(r => r.date.toISOString().split('T')[0]))]
    const uniqueDates = dates.length
    const avgDosage = uniqueDates > 0 ? Math.round(totalDosage / uniqueDates) : 0

    const medicineStats = {}
    records.forEach(r => {
      if (!medicineStats[r.medicine_name]) {
        medicineStats[r.medicine_name] = { name: r.medicine_name, total: 0, count: 0 }
      }
      medicineStats[r.medicine_name].total += r.breakfast + r.lunch + r.dinner
      medicineStats[r.medicine_name].count++
    })

    res.json({
      totalRecords,
      totalDosage,
      uniqueDates,
      avgDosage,
      medicineStats: Object.values(medicineStats).sort((a, b) => b.total - a.total)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '获取统计概览失败' })
  }
})

// ==================== 药品购买记录 API ====================

app.get('/api/purchase-records', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medicine_purchase_records ORDER BY purchase_date DESC')
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '获取购买记录失败' })
  }
})

app.post('/api/purchase-records', async (req, res) => {
  const { purchaseDate, medicineName, quantity, unit, unitPrice, totalPrice, channel, notes } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO medicine_purchase_records
       (purchase_date, medicine_name, quantity, unit, unit_price, total_price, channel, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [purchaseDate, medicineName, quantity, unit || '盒', unitPrice, totalPrice, channel || '', notes || '']
    )
    res.json({ id: result.insertId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '添加购买记录失败' })
  }
})

app.put('/api/purchase-records/:id', async (req, res) => {
  const { id } = req.params
  const { purchaseDate, medicineName, quantity, unit, unitPrice, totalPrice, channel, notes } = req.body
  try {
    await pool.query(
      `UPDATE medicine_purchase_records
       SET purchase_date = ?, medicine_name = ?, quantity = ?, unit = ?, unit_price = ?, total_price = ?, channel = ?, notes = ?
       WHERE id = ?`,
      [purchaseDate, medicineName, quantity, unit || '盒', unitPrice, totalPrice, channel || '', notes || '', id]
    )
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '更新购买记录失败' })
  }
})

app.delete('/api/purchase-records/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM medicine_purchase_records WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '删除购买记录失败' })
  }
})

app.delete('/api/purchase-records/batch', async (req, res) => {
  const { ids } = req.body
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids 不能为空' })
    return
  }
  try {
    const placeholders = ids.map(() => '?').join(',')
    await pool.query(`DELETE FROM medicine_purchase_records WHERE id IN (${placeholders})`, ids)
    res.json({ success: true, deletedCount: ids.length })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '批量删除购买记录失败' })
  }
})

app.get('/api/purchase-stats/overview', async (req, res) => {
  try {
    const [records] = await pool.query('SELECT * FROM medicine_purchase_records')

    const totalRecords = records.length
    const totalQuantity = records.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0)
    const totalAmount = records.reduce((sum, r) => sum + (parseFloat(r.total_price) || 0), 0)

    const medicineStats = {}
    records.forEach(r => {
      if (!medicineStats[r.medicine_name]) {
        medicineStats[r.medicine_name] = { name: r.medicine_name, totalQuantity: 0, totalAmount: 0, count: 0 }
      }
      medicineStats[r.medicine_name].totalQuantity += parseInt(r.quantity) || 0
      medicineStats[r.medicine_name].totalAmount += parseFloat(r.total_price) || 0
      medicineStats[r.medicine_name].count++
    })

    res.json({
      totalRecords,
      totalQuantity,
      totalAmount,
      medicineStats: Object.values(medicineStats).sort((a, b) => b.totalAmount - a.totalAmount)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '获取购买统计失败' })
  }
})

initializeApp()
