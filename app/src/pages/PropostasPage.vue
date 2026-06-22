<template>
  <q-page class="q-pa-lg" style="background-color: #F8FAFC;">

    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold text-grey-9">Propostas</div>
      <q-btn flat round icon="refresh" color="grey-7" @click="carregarTudo">
        <q-tooltip>Atualizar</q-tooltip>
      </q-btn>
    </div>

    <!-- Abas -->
    <q-tabs v-model="aba" align="left" active-color="primary" indicator-color="primary" class="text-grey-7 q-mb-md" no-caps>
      <q-tab v-if="ehSolicitante" name="recebidas" label="Recebidas" />
      <q-tab v-if="ehMotorista" name="enviadas" label="Enviadas" />
    </q-tabs>

    <!-- Carregando -->
    <div v-if="carregando">
      <q-card v-for="n in 2" :key="n" flat bordered class="q-mb-md q-pa-md rounded-borders">
        <q-skeleton type="text" width="40%" />
        <q-skeleton type="text" width="70%" class="q-mt-sm" />
        <q-skeleton type="rect" height="48px" class="q-mt-md" />
      </q-card>
    </div>

    <!-- ABA: RECEBIDAS (sou o solicitante) -->
    <template v-else-if="aba === 'recebidas'">
      <q-banner v-if="grupos.length === 0" class="bg-white text-grey-7 rounded-borders" rounded>
        <template v-slot:avatar><q-icon name="inbox" color="grey-5" /></template>
        Você ainda não recebeu propostas nas suas solicitações.
      </q-banner>

      <q-card v-for="g in grupos" :key="g.encomenda.id" flat bordered class="q-mb-lg rounded-borders">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-grey-9">
            {{ formatarLocal(g.encomenda.coleta_cidade, g.encomenda.coleta_logradouro) }}
            <q-icon name="arrow_forward" size="xs" class="q-mx-xs text-grey-6" />
            {{ formatarLocal(g.encomenda.entrega_cidade, g.encomenda.entrega_logradouro) }}
          </div>
          <div class="text-caption text-grey-6">
            {{ g.encomenda.descricao }}<span v-if="g.encomenda.peso"> ({{ g.encomenda.peso }}kg)</span>
            <span class="q-mx-sm">•</span>
            <span :class="`text-${corStatus(g.encomenda.status)}`">{{ rotuloStatus(g.encomenda.status) }}</span>
          </div>
        </q-card-section>

        <q-separator />

        <q-list separator>
          <q-item v-for="p in g.propostas" :key="p.id">
            <q-item-section avatar>
              <q-avatar color="blue" text-color="white">{{ inicial(p.motorista_nome) }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium text-grey-9">{{ p.motorista_nome }}</q-item-label>
              <q-item-label caption>
                <q-badge :color="corProposta(p.status)" :label="rotuloProposta(p.status)" />
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">{{ formatarValor(p.valor_proposto) }}</div>
              <div v-if="p.status === 'PENDENTE' && g.encomenda.status !== 'ACEITA'" class="row q-gutter-xs justify-end">
                <q-btn flat dense color="primary" icon="swap_horiz" label="Sugerir valor"
                  @click="pedirNegociacao({ destinatarioId: p.motorista_id, destinatarioNome: p.motorista_nome, encomenda: g.encomenda, valorAtual: p.valor_proposto })" />
                <q-btn unelevated dense color="positive" icon="check" label="Aceitar"
                  :loading="processandoId === p.id" @click="pedirAceite(p, g.encomenda)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </template>

    <!-- ABA: ENVIADAS (sou o transportador) -->
    <template v-else>
      <q-banner v-if="enviadas.length === 0" class="bg-white text-grey-7 rounded-borders" rounded>
        <template v-slot:avatar><q-icon name="send" color="grey-5" /></template>
        Você ainda não enviou propostas. Vá ao Mural de Fretes para propor.
      </q-banner>

      <q-card v-for="item in enviadas" :key="item.id" flat bordered class="q-mb-md rounded-borders">
        <q-card-section class="row items-center no-wrap q-col-gutter-md">
          <q-avatar square size="44px" color="blue-grey-1" text-color="blue-grey-7" icon="inventory_2" />
          <div class="col">
            <div class="text-subtitle1 text-weight-bold text-grey-9">
              {{ formatarLocal(item.encomenda.coleta_cidade, item.encomenda.coleta_logradouro) }}
              <q-icon name="arrow_forward" size="xs" class="q-mx-xs text-grey-6" />
              {{ formatarLocal(item.encomenda.entrega_cidade, item.encomenda.entrega_logradouro) }}
            </div>
            <div class="text-caption text-grey-6">
              {{ item.descricao }}<span v-if="item.peso"> ({{ item.peso }}kg)</span>
              <span class="q-mx-sm">•</span>Solicitante: {{ item.cliente_nome }}
            </div>
            <q-badge :color="corProposta(item.status)" :label="rotuloProposta(item.status)" class="q-mt-xs" />
          </div>
          <div class="text-right column items-end" style="min-width: 130px;">
            <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">{{ formatarValor(item.valor_proposto) }}</div>
            <div v-if="item.status === 'PENDENTE' && item.encomenda_status !== 'ACEITA'" class="row q-gutter-xs justify-end">
              <q-btn
                flat dense color="primary" icon="swap_horiz" label="Sugerir valor"
                @click="pedirNegociacao({ destinatarioId: item.encomenda.cliente_id, destinatarioNome: item.cliente_nome, encomenda: item.encomenda, valorAtual: item.valor_proposto })"
              />
              <q-btn
                flat dense color="negative" icon="delete" label="Cancelar"
                :loading="processandoId === item.id"
                @click="cancelarProposta(item)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>

    <!-- Dialog: sugerir outro valor (negociação) -->
    <q-dialog v-model="dialogNegociar">
      <q-card style="min-width: 340px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="swap_horiz" color="primary" size="sm" class="q-mr-sm" />
          <div class="text-h6">Sugerir outro valor</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-sm" v-if="negociacao">
          <div class="text-caption text-grey-7 q-mb-md">
            Sua contraproposta será enviada por mensagem a <b>{{ negociacao.destinatarioNome }}</b>
            (valor atual: {{ formatarValor(negociacao.valorAtual) }}).
          </div>
          <q-input outlined dense type="number" v-model="valorSugerido" label="Valor sugerido" prefix="R$" />
          <q-input outlined dense type="textarea" v-model="mensagemNegociar" label="Mensagem (opcional)" class="q-mt-md" autogrow />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Enviar" color="primary" :loading="enviandoNegociacao" @click="enviarNegociacao" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: confirmar aceite -->
    <q-dialog v-model="dialogAceite">
      <q-card style="min-width: 320px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="check_circle" color="positive" size="sm" class="q-mr-sm" />
          <div class="text-h6">Aceitar proposta</div>
        </q-card-section>
        <q-card-section class="text-body2 text-grey-8" v-if="propostaSelecionada">
          Aceitar a proposta de <b>{{ propostaSelecionada.motorista_nome }}</b>
          por <b>{{ formatarValor(propostaSelecionada.valor_proposto) }}</b>?
          As demais propostas deste frete serão recusadas.
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Voltar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Sim, aceitar" color="positive" :loading="processandoId !== null" @click="confirmarAceite" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = 'http://localhost:3000/api'

const aba = ref('recebidas')
const meuId = ref(null)
const tipoUsuario = ref('')

const ehSolicitante = computed(() => ['CLIENTE', 'AMBOS', 'ADMIN'].includes(tipoUsuario.value))
const ehMotorista = computed(() => ['MOTORISTA', 'AMBOS', 'ADMIN'].includes(tipoUsuario.value))
const grupos = ref([]) // recebidas: [{ encomenda, propostas: [] }]
const enviadas = ref([]) // enviadas: propostas + { encomenda }
const carregando = ref(false)
const processandoId = ref(null)

const dialogAceite = ref(false)
const propostaSelecionada = ref(null)

const dialogNegociar = ref(false)
const negociacao = ref(null)
const valorSugerido = ref('')
const mensagemNegociar = ref('')
const enviandoNegociacao = ref(false)

const STATUS = {
  DISPONIVEL: { rotulo: 'Disponível', cor: 'blue-grey' },
  AGUARDANDO_PROPOSTAS: { rotulo: 'Aguardando propostas', cor: 'orange' },
  ACEITA: { rotulo: 'Proposta aceita', cor: 'teal' },
  EM_TRANSITO: { rotulo: 'Em trânsito', cor: 'blue' },
  ENTREGUE: { rotulo: 'Entregue', cor: 'green' },
  CANCELADA: { rotulo: 'Cancelada', cor: 'grey' },
}
const STATUS_PROPOSTA = {
  PENDENTE: { rotulo: 'Pendente', cor: 'orange' },
  ACEITA: { rotulo: 'Aceita', cor: 'positive' },
  RECUSADA: { rotulo: 'Recusada', cor: 'grey' },
}

function rotuloStatus(s) { return STATUS[s]?.rotulo || s }
function corStatus(s) { return STATUS[s]?.cor || 'grey' }
function rotuloProposta(s) { return STATUS_PROPOSTA[s]?.rotulo || s }
function corProposta(s) { return STATUS_PROPOSTA[s]?.cor || 'grey' }

function inicial(nome) { return (nome || '?').charAt(0).toUpperCase() }
function formatarLocal(cidade, logradouro) { return cidade || logradouro || 'Não informado' }
function formatarValor(v) {
  if (v === null || v === undefined || v === '') return 'A combinar'
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function carregarTudo() {
  carregando.value = true
  try {
    const resMe = await fetch(`${API_URL}/usuarios/me`, { credentials: 'include' })
    const me = await resMe.json()
    if (!resMe.ok) throw new Error(me.erro || 'Erro ao identificar o usuário.')
    meuId.value = me.id
    tipoUsuario.value = me.tipo || ''

    // aba inicial conforme o papel
    aba.value = ehSolicitante.value ? 'recebidas' : 'enviadas'

    await Promise.all([carregarRecebidas(), carregarEnviadas()])
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    carregando.value = false
  }
}

async function carregarRecebidas() {
  const res = await fetch(`${API_URL}/encomendas/minhas`, { credentials: 'include' })
  const fretes = res.ok ? await res.json() : []
  const minhas = fretes.filter((e) => e.cliente_id === meuId.value)

  const resultados = await Promise.all(
    minhas.map(async (encomenda) => {
      const r = await fetch(`${API_URL}/encomendas/${encomenda.id}/propostas`, { credentials: 'include' })
      const propostas = r.ok ? await r.json() : []
      return { encomenda, propostas }
    })
  )
  grupos.value = resultados.filter((g) => g.propostas.length > 0)
}

async function carregarEnviadas() {
  const res = await fetch(`${API_URL}/propostas/minhas`, { credentials: 'include' })
  const lista = res.ok ? await res.json() : []

  // Enriquece com os dados da encomenda (cliente_id, cidades) para exibir e negociar
  enviadas.value = await Promise.all(
    lista.map(async (p) => {
      const r = await fetch(`${API_URL}/encomendas/${p.encomenda_id}`, { credentials: 'include' })
      const encomenda = r.ok ? await r.json() : {}
      return { ...p, encomenda }
    })
  )
}

// ---- Negociação (envia contraproposta por mensagem) ----
function pedirNegociacao({ destinatarioId, destinatarioNome, encomenda, valorAtual }) {
  negociacao.value = { destinatarioId, destinatarioNome, encomenda, valorAtual }
  valorSugerido.value = ''
  mensagemNegociar.value = ''
  dialogNegociar.value = true
}

async function enviarNegociacao() {
  const n = negociacao.value
  if (!n) return
  if (!valorSugerido.value) {
    $q.notify({ type: 'negative', message: 'Informe o valor sugerido.', position: 'top-right' })
    return
  }

  const origem = formatarLocal(n.encomenda.coleta_cidade, n.encomenda.coleta_logradouro)
  const destino = formatarLocal(n.encomenda.entrega_cidade, n.encomenda.entrega_logradouro)
  const valorFmt = Number(valorSugerido.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  let texto = `💬 Contraproposta para o frete ${origem} → ${destino}: ${valorFmt} (valor atual: ${formatarValor(n.valorAtual)}).`
  if (mensagemNegociar.value && mensagemNegociar.value.trim()) texto += ` ${mensagemNegociar.value.trim()}`

  enviandoNegociacao.value = true
  try {
    const res = await fetch(`${API_URL}/mensagens`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinatario_id: n.destinatarioId, texto, encomenda_id: n.encomenda.id }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao enviar contraproposta.')

    $q.notify({ type: 'positive', message: 'Contraproposta enviada por mensagem!', position: 'top-right' })
    dialogNegociar.value = false
    negociacao.value = null
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    enviandoNegociacao.value = false
  }
}

// ---- Aceite (somente solicitante) ----
function pedirAceite(proposta, encomenda) {
  propostaSelecionada.value = { ...proposta, _encomenda: encomenda }
  dialogAceite.value = true
}

async function confirmarAceite() {
  const p = propostaSelecionada.value
  if (!p) return

  processandoId.value = p.id
  try {
    const res = await fetch(`${API_URL}/propostas/${p.id}/aceitar`, {
      method: 'PATCH',
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao aceitar proposta.')

    $q.notify({ type: 'positive', message: 'Proposta aceita! O frete foi atribuído ao transportador.', position: 'top-right' })
    dialogAceite.value = false
    propostaSelecionada.value = null
    await carregarTudo()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    processandoId.value = null
  }
}

// ---- Cancelar proposta (somente o motorista que a enviou) ----
async function cancelarProposta(item) {
  processandoId.value = item.id
  try {
    const res = await fetch(`${API_URL}/propostas/${item.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.erro || 'Erro ao cancelar proposta.')
    }
    $q.notify({ type: 'positive', message: 'Proposta cancelada.', position: 'top-right' })
    await carregarTudo()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    processandoId.value = null
  }
}

onMounted(carregarTudo)
</script>
