import Papa from 'papaparse'

export const exportToCSV = (data, filename, headers) => {
  const csv = Papa.unparse({
    fields: headers,
    data: data
  })
  
  // 添加BOM头
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { 
    type: 'text/csv;charset=utf-8;' 
  })
  
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
} 