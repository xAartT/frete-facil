import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Bloqueia telas internas se o usuário não estiver autenticado
  Router.beforeEach(async (to) => {
    if (!to.matched.some((r) => r.meta?.requiresAuth)) return true

    try {
      const res = await fetch('http://localhost:3000/api/usuarios/me', { credentials: 'include' })
      if (res.ok) return true
    } catch {
      // sem conexão/sessão: cai no redirecionamento abaixo
    }
    return { path: '/login' }
  })

  return Router
})
