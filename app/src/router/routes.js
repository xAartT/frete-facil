const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },

    {
    path: '/cadastro',
    component: () => import('pages/CadastroPage.vue')
  },
  
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ]
  },


  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
