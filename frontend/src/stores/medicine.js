import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRecords } from '@/api/medication'

export const useMedicineStore = defineStore('medicine', () => {
  const medicineNames = ref([])
  const loading = ref(false)

  const medicineOptions = computed(() => 
    medicineNames.value.map(name => ({
      label: name,
      value: name
    }))
  )

  const fetchMedicines = async () => {
    loading.value = true
    try {
      const response = await getRecords()
      const names = new Set()
      response.data.forEach(record => {
        if (record.medicine_name) {
          names.add(record.medicine_name)
        }
      })
      medicineNames.value = Array.from(names).sort()
    } catch (error) {
      console.error('获取药品列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const getMedicineByName = (name) => {
    return medicineNames.value.includes(name) ? { name } : null
  }

  return {
    medicineNames,
    loading,
    medicineOptions,
    fetchMedicines,
    getMedicineByName
  }
})
