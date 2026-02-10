import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export const parseCSV = (file, callback) => {
  Papa.parse(file, {
    complete: (results) => {
      callback(results.data)
    },
    header: true,
    skipEmptyLines: true
  })
}

export const parseExcel = (file, callback) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      
      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      const result = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
        blankrows: false,
        cellDates: true
      })
      
      // 处理日期格式转换
      const processedData = result.map(item => {
        // 转换Excel日期格式为YYYY-MM-DD字符串
        const dateValue = item.date || item.日期
        if (dateValue instanceof Date) {
          item.date = XLSX.SSF.format('yyyy-mm-dd', dateValue)
        } else if (typeof dateValue === 'number') {
          const jsDate = new Date((dateValue - (25567 + 2)) * 86400 * 1000)
          item.date = jsDate.toISOString().split('T')[0]
        } else if (typeof dateValue === 'string') {
          item.date = dateValue
        }
        
        return item
      }).filter(item => item.date || item.日期)
      
      callback(processedData)
    } catch (error) {
      console.error('Excel解析错误:', error)
      callback([])
    }
  }
  reader.readAsArrayBuffer(file)
}
