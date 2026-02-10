const express = require('express')
const cors = require('cors')
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 9500

// 创建数据库连接池
const createPool = async () => {
  try {
    // 首先创建基础连接（不指定数据库）
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    })

    // 创建数据库（如果不存在）
    await connection.query('CREATE DATABASE IF NOT EXISTS medication_db')
    await connection.query('USE medication_db')

    // 读取并执行初始化SQL
    const initSqlPath = path.join(__dirname, 'config', 'init.sql')
    const initSql = fs.readFileSync(initSqlPath, 'utf8')
    
    // 分割SQL语句并执行
    const sqlStatements = initSql.split(';').filter(stmt => stmt.trim())
    for (const stmt of sqlStatements) {
      if (stmt.trim()) {
        await connection.query(stmt + ';')
      }
    }

    await connection.end()

    // 创建连接池
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

// 全局连接池
let pool

const initializeApp = async () => {
  try {
    pool = await createPool()
    console.log('数据库初始化成功')
    
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`)
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

// 启动应用
initializeApp()
