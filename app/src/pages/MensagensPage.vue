<template>
  <q-page class="row no-wrap" style="height: 100vh;">

    <!-- Coluna: lista de conversas -->
    <div class="column no-wrap bg-white" style="width: 320px; border-right: 1px solid #e2e8f0;">
      <div class="q-pa-md">
        <div class="text-h6 text-weight-bold text-grey-9 q-mb-md">Mensagens</div>
        <q-input outlined dense rounded v-model="busca" placeholder="Buscar conversas...">
          <template v-slot:prepend><q-icon name="search" color="grey-6" /></template>
        </q-input>
      </div>

      <q-scroll-area class="col">
        <div v-if="carregandoConversas" class="q-pa-md">
          <q-item v-for="n in 4" :key="n">
            <q-item-section avatar><q-skeleton type="QAvatar" /></q-item-section>
            <q-item-section>
              <q-skeleton type="text" />
              <q-skeleton type="text" width="60%" />
            </q-item-section>
          </q-item>
        </div>

        <div v-else-if="conversasFiltradas.length === 0" class="text-center text-grey-6 q-pa-lg text-caption">
          Nenhuma conversa ainda.
        </div>

        <q-list v-else>
          <q-item
            v-for="c in conversasFiltradas"
            :key="c.outro_id"
            clickable v-ripple
            :active="c.outro_id === conversaAtivaId"
            active-class="bg-blue-1"
            @click="selecionarConversa(c)"
          >
            <q-item-section avatar>
              <q-avatar :color="corAvatar(c.outro_id)" text-color="white">{{ inicial(c.outro_nome) }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium text-grey-9">{{ c.outro_nome }}</q-item-label>
              <q-item-label caption lines="1">{{ c.ultima_mensagem }}</q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-item-label caption>{{ formatarHora(c.criado_em) }}</q-item-label>
              <q-badge v-if="c.nao_lidas > 0" color="primary" rounded class="q-mt-xs">{{ c.nao_lidas }}</q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </div>

    <!-- Coluna: janela de chat -->
    <div class="col column no-wrap" style="background-color: #F8FAFC;">
      <template v-if="conversaAtiva">

        <!-- Cabeçalho -->
        <div class="row items-center q-pa-md bg-white" style="border-bottom: 1px solid #e2e8f0;">
          <q-avatar :color="corAvatar(conversaAtiva.outro_id)" text-color="white">{{ inicial(conversaAtiva.outro_nome) }}</q-avatar>
          <div class="q-ml-md col">
            <div class="text-weight-bold text-grey-9">{{ conversaAtiva.outro_nome }}</div>
          </div>
          <q-btn flat round dense icon="refresh" color="grey-7" @click="carregarMensagens(conversaAtiva.outro_id)">
            <q-tooltip>Atualizar</q-tooltip>
          </q-btn>
        </div>

        <!-- Mensagens -->
        <div ref="msgContainer" class="col q-px-md q-py-sm" style="overflow-y: auto;">
          <div v-if="mensagens.length === 0 && !carregandoMensagens" class="text-center text-grey-5 q-mt-xl">
            Nenhuma mensagem ainda. Diga olá! 👋
          </div>

          <div
            v-for="m in mensagens"
            :key="m.id"
            class="row q-mb-sm"
            :class="m.remetente_id === meuId ? 'justify-end' : 'justify-start'"
          >
            <div class="bolha" :class="m.remetente_id === meuId ? 'bolha-eu' : 'bolha-outro'">
              <div>{{ m.texto }}</div>
              <div class="text-caption q-mt-xs" :class="m.remetente_id === meuId ? 'text-blue-2 text-right' : 'text-grey-5'">
                {{ formatarHora(m.criado_em) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Barra de envio -->
        <div class="row items-center q-pa-md bg-white" style="border-top: 1px solid #e2e8f0;">
          <q-input
            outlined dense rounded
            v-model="novaMensagem"
            placeholder="Escreva sua mensagem..."
            class="col q-mr-sm"
            :disable="enviando"
            @keyup.enter="enviar"
          />
          <q-btn round color="primary" icon="send" :loading="enviando" :disable="!novaMensagem.trim()" @click="enviar" />
        </div>

      </template>

      <!-- Nenhuma conversa selecionada -->
      <div v-else class="col flex flex-center text-grey-6">
        <div class="text-center">
          <q-icon name="forum" size="64px" class="text-grey-4" />
          <div class="q-mt-sm">Selecione uma conversa para começar.</div>
        </div>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = 'http://localhost:3000/api'

const meuId = ref(null)
const conversas = ref([])
const mensagens = ref([])
const conversaAtiva = ref(null)
const conversaAtivaId = computed(() => conversaAtiva.value?.outro_id ?? null)

const busca = ref('')
const novaMensagem = ref('')
const carregandoConversas = ref(false)
const carregandoMensagens = ref(false)
const enviando = ref(false)


const msgContainer = ref(null)
let pollId = null

const conversasFiltradas = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return conversas.value
  return conversas.value.filter((c) => (c.outro_nome || '').toLowerCase().includes(termo))
})

function inicial(nome) {
  return (nome || '?').charAt(0).toUpperCase()
}

// cor estável por usuário (apenas visual)
const CORES = ['blue', 'teal', 'deep-orange', 'purple', 'green', 'indigo', 'pink', 'brown']
function corAvatar(id) {
  return CORES[(id || 0) % CORES.length]
}

function formatarHora(data) {
  if (!data) return ''
  return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function pertoDoFim() {
  const el = msgContainer.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

async function rolarParaFim() {
  await nextTick()
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

async function carregarUsuario() {
  try {
    const res = await fetch(`${API_URL}/usuarios/me`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao identificar o usuário.')
    meuId.value = data.id
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  }
}

async function carregarConversas() {
  carregandoConversas.value = true
  try {
    const res = await fetch(`${API_URL}/mensagens/conversas`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao carregar conversas.')
    conversas.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    carregandoConversas.value = false
  }
}

async function carregarMensagens(outroId, silencioso = false) {
  if (!silencioso) carregandoMensagens.value = true
  const estavaNoFim = pertoDoFim()
  try {
    const res = await fetch(`${API_URL}/mensagens/conversa/${outroId}`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao carregar mensagens.')
    mensagens.value = data
    if (estavaNoFim) rolarParaFim()
  } catch (error) {
    if (!silencioso) {
      $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
    }
  } finally {
    carregandoMensagens.value = false
  }
}

async function selecionarConversa(c) {
  conversaAtiva.value = { outro_id: c.outro_id, outro_nome: c.outro_nome }
  mensagens.value = []
  await carregarMensagens(c.outro_id)
  c.nao_lidas = 0
}

async function enviar() {
  const texto = novaMensagem.value.trim()
  if (!texto || !conversaAtiva.value) return

  enviando.value = true
  try {
    const res = await fetch(`${API_URL}/mensagens`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinatario_id: conversaAtiva.value.outro_id,
        texto,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao enviar mensagem.')

    mensagens.value.push(data)
    novaMensagem.value = ''
    rolarParaFim()
    carregarConversas()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    enviando.value = false
  }
}

onMounted(async () => {
  await carregarUsuario()
  await carregarConversas()

  // atualização leve: recarrega a conversa aberta e a lista a cada 5s
  pollId = setInterval(() => {
    if (conversaAtiva.value) carregarMensagens(conversaAtiva.value.outro_id, true)
    carregarConversas()
  }, 5000)
})

onUnmounted(() => {
  if (pollId) clearInterval(pollId)
})
</script>

<style scoped>
.bolha {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.35;
  word-break: break-word;
}
.bolha-outro {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #1f2937;
  border-top-left-radius: 2px;
}
.bolha-eu {
  background-color: #1976d2;
  color: #ffffff;
  border-top-right-radius: 2px;
}
</style>
