import { defineStore } from 'pinia'
import { type Template } from '@/types/api'
import { api } from "@/shared/api"

export const useWorkoutStore = defineStore('workouts', {
  state: () => ({
    templates: [] as Template[],
    loaded: false
  }),

  actions: {
    async fetchTemplates() {
      if (this.loaded) return  // ← кэширование

      const res = await api.get('/templates/')
      this.templates = res.data
      this.loaded = true
    }
  }
})
