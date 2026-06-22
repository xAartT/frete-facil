<template>
  <q-layout view="lHh Lpr lFf" class="shadow-2 rounded-borders">
    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :mini="miniState"
      :width="250"
      :breakpoint="500"
      style="background-color: #F8FAFC;"
    >
      <div class="column full-height">
        
        <q-scroll-area class="col">
          <q-list padding>
            
            <q-item>
              <q-item-section avatar>
                <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleMiniState" />
              </q-item-section>
            </q-item>

            <EssentialLink
              v-for="link in linksVisiveis"
              :key="link.title"
              v-bind="link"
            />
          </q-list>
        </q-scroll-area>

        <q-separator />
        <q-list padding>
          <q-item clickable v-ripple to="/perfil">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">{{ inicial }}</q-avatar>
            </q-item-section>
            <q-item-section class="text-grey-9 text-weight-bold">
              {{ nomeUsuario || 'Meu perfil' }}
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="sair">
            <q-item-section avatar>
              <q-icon name="arrow_back" color="black" />
            </q-item-section>
            <q-item-section class="text-black text-weight-bold">
              Sair
            </q-item-section>
          </q-item>
        </q-list>

      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EssentialLink from 'components/EssentialLink.vue'

const router = useRouter()

async function sair() {
  try {
    await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' })
  } catch {
    // mesmo se falhar, segue para a tela de login
  }
  router.push('/login')
}

const nomeUsuario = ref('')
const tipoUsuario = ref('')
const inicial = computed(() => (nomeUsuario.value || '?').charAt(0).toUpperCase())

const ehSolicitante = computed(() => ['CLIENTE', 'AMBOS', 'ADMIN'].includes(tipoUsuario.value))
const ehMotorista = computed(() => ['MOTORISTA', 'AMBOS', 'ADMIN'].includes(tipoUsuario.value))

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/usuarios/me', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      nomeUsuario.value = data.nome || ''
      tipoUsuario.value = data.tipo || ''
    }
  } catch {
    // sem nome: mostra "Meu perfil"
  }
})

// papel: 'solicitante' | 'motorista' | 'ambos' (ambos = sempre visível)
const essentialLinks = [
  { title: 'Dashboard', icon: 'dashboard', link: '/dashboard', papel: 'ambos' },
  { title: 'Solicitar frete', icon: 'add_box', link: '/solicitar-frete', papel: 'solicitante' },
  { title: 'Mural de fretes', icon: 'sell', link: '/oferecer-frete', papel: 'motorista' },
  { title: 'Meus fretes', icon: 'assignment', link: '/meus-fretes', papel: 'ambos' },
  { title: 'Propostas', icon: 'gavel', link: '/propostas', papel: 'ambos' },
  { title: 'Mensagens', icon: 'chat', link: '/mensagens', papel: 'ambos' }
]

const linksVisiveis = computed(() =>
  essentialLinks.filter((l) => {
    if (l.papel === 'solicitante') return ehSolicitante.value
    if (l.papel === 'motorista') return ehMotorista.value
    return true
  })
)

const drawer = ref(true)
const miniState = ref(false)

function toggleMiniState () {
  miniState.value = !miniState.value
}
</script>