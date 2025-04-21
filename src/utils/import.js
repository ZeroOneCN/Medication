import Papa from 'papaparse'

export const parseCSV = (file, callback) => {
  Papa.parse(file, {
    complete: (results) => {
      callback(results.data)
    },
    header: true,
    skipEmptyLines: true
  })
} 