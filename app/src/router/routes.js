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
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'solicitar-frete', component: () => import('pages/SolicFretePage.vue') },
      { path: 'oferecer-frete', component: () => import('pages/OfertaFrete.vue') },
      { path: 'meus-fretes', component: () => import('pages/MeusfretesPage.vue') },
      { path: 'mensagens', component: () => import('pages/MensagensPage.vue') },
      { path: 'cadastro', component: () => import('pages/CadastroPage.vue') }
      
    ]
  },


  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
