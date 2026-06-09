import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default defineBoot(({ app }) => {

  api.interceptors.response.use((res) => {
    if (res.status === 200) {
      return res;
    }
  }, () => {
    window.location.href = "/login";
  });

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
