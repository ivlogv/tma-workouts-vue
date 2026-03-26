import axios from "axios"
import { retrieveRawInitData } from "@tma.js/sdk-vue"

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
})

// каждый запрос будет автоматически получать актуальный initDataRaw
api.interceptors.request.use((config) => {
  const initDataRaw = retrieveRawInitData()
  if (initDataRaw) {
    config.headers.Authorization = `tma ${initDataRaw}`
  }
  return config
})


// base api instance with the base URL and default headers
// const api = axios.create({
//   baseURL: "http://localhost:8000/api",
//   headers: {
//     Authorization: `tma ${initDataRaw}`,
//   },
// });
