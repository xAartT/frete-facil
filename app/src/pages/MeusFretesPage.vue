<template>
  <q-page class="q-pa-lg" style="background-color: #F8FAFC;">

    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold text-grey-9">Meus Fretes</div>
      <q-btn flat round icon="refresh" color="grey-7" @click="carregarTudo">
        <q-tooltip>Atualizar</q-tooltip>
      </q-btn>
    </div>

    <!-- Abas -->
    <q-tabs
      v-model="aba"
      align="left"
      active-color="primary"
      indicator-color="primary"
      class="text-grey-7 q-mb-md"
      no-caps
    >
      <q-tab v-if="ehSolicitante" name="remetente" label="Como Remetente" />
      <q-tab v-if="ehMotorista" name="transportador" label="Como Transportador" />
    </q-tabs>

    <!-- Carregando -->
    <div v-if="carregando">
      <q-card v-for="n in 3" :key="n" flat bordered class="q-mb-md q-pa-md rounded-borders">
        <div class="row items-center q-col-gutter-md">
          <q-skeleton type="QAvatar" />
          <div class="col">
            <q-skeleton type="text" width="40%" />
            <q-skeleton type="text" width="70%" />
          </div>
          <q-skeleton type="QBtn" />
        </div>
      </q-card>
    </div>

    <!-- Vazio -->
    <q-banner v-else-if="listaAtual.length === 0" class="bg-white text-grey-7 rounded-borders" rounded>
      <template v-slot:avatar><q-icon name="local_shipping" color="grey-5" /></template>
      {{ aba === 'remetente'
        ? 'Você ainda não solicitou nenhum frete.'
        : 'Você ainda não está transportando nenhuma encomenda.' }}
    </q-banner>

    <!-- Lista de fretes -->
    <div v-else>
      <q-card v-for="enc in listaAtual" :key="enc.id" flat bordered class="q-mb-md rounded-borders">
        <q-card-section class="row items-center no-wrap q-col-gutter-md">

          <q-icon :name="iconeStatus(enc.status)" :color="`${corStatus(enc.status)}-7`" size="32px" />

          <div class="col">
            <q-chip dense :color="`${corStatus(enc.status)}-1`" :text-color="`${corStatus(enc.status)}-9`" class="text-caption text-weight-bold q-ma-none q-mb-xs">
              {{ rotuloStatus(enc.status) }}
            </q-chip>

            <div class="text-subtitle1 text-weight-bold text-grey-9">
              {{ formatarLocal(enc.coleta_cidade, enc.coleta_logradouro) }}
              <q-icon name="arrow_forward" size="xs" class="q-mx-xs text-grey-6" />
              {{ formatarLocal(enc.entrega_cidade, enc.entrega_logradouro) }}
            </div>

            <div class="text-caption text-grey-6 q-mt-xs">
              <q-icon name="event" size="xs" class="q-mr-xs" />{{ formatarData(enc.data_criacao) }}
              <span class="q-mx-sm">•</span>
              <q-icon name="inventory_2" size="xs" class="q-mr-xs" />{{ enc.descricao }}<span v-if="enc.peso"> ({{ enc.peso }}kg)</span>
            </div>
          </div>

          <!-- Avaliações do frete -->
          <div v-if="avaliacoesDe(enc).length" class="column q-gutter-xs" style="min-width: 210px; max-width: 260px;">
            <div v-for="a in avaliacoesDe(enc)" :key="a.id">
              <div class="row items-center no-wrap">
                <span class="text-caption text-weight-medium text-grey-8 q-mr-xs">{{ String(a.avaliador_id) === String(meuId) ? 'Você' : a.avaliador_nome }}</span>
                <q-rating :model-value="a.nota" max="5" size="1em" color="amber" readonly />
              </div>
              <div v-if="a.comentario" class="text-caption text-grey-6" style="font-style: italic;">"{{ a.comentario }}"</div>
            </div>
          </div>

          <div class="text-right column items-end" style="min-width: 130px;">
            <div class="text-h6 text-weight-bold text-grey-9 q-mb-sm">{{ formatarValor(enc.valor_aceito ?? enc.valor_sugerido) }}</div>

            <!-- Ações do transportador -->
            <template v-if="aba === 'transportador'">
              <q-btn
                v-if="enc.status === 'ACEITA'"
                unelevated dense color="primary" icon="local_shipping" label="Iniciar Transporte"
                :loading="processandoId === enc.id" @click="atualizarStatus(enc, 'EM_TRANSITO')"
              />
              <q-btn
                v-else-if="enc.status === 'EM_TRANSITO'"
                unelevated dense color="positive" icon="check" label="Confirmar Entrega"
                :loading="processandoId === enc.id" @click="atualizarStatus(enc, 'ENTREGUE')"
              />
            </template>

            <!-- Ações do remetente -->
            <template v-else>
              <q-btn
                v-if="['DISPONIVEL', 'AGUARDANDO_PROPOSTAS', 'ACEITA'].includes(enc.status)"
                flat dense color="negative" icon="close" label="Cancelar"
                @click="pedirCancelamento(enc)"
              />
            </template>

            <!-- Avaliar (após entrega) -->
            <q-btn
              v-if="enc.status === 'ENTREGUE' && !enc._avaliado"
              flat dense color="amber-8" icon="star" label="Avaliar"
              @click="pedirAvaliacao(enc)"
            />
          </div>

        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog: avaliar -->
    <q-dialog v-model="dialogAvaliar">
      <q-card style="min-width: 320px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Avaliar</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="column items-center">
          <div class="text-body2 text-grey-7 q-mb-sm">Como foi a experiência neste frete?</div>
          <q-rating v-model="avaliacao.nota" :max="5" size="2.2em" color="amber" />
          <q-input
            outlined dense type="textarea" v-model="avaliacao.comentario"
            label="Comentário (opcional)" class="full-width q-mt-md" autogrow
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Enviar avaliação" color="primary" :loading="enviandoAvaliacao" @click="enviarAvaliacao" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: confirmar cancelamento -->
    <q-dialog v-model="dialogCancelar">
      <q-card style="min-width: 320px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="warning" color="negative" size="sm" class="q-mr-sm" />
          <div class="text-h6">Cancelar frete</div>
        </q-card-section>
        <q-card-section class="text-body2 text-grey-8">
          Tem certeza que deseja cancelar esta solicitação? Essa ação não pode ser desfeita.
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Voltar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Sim, cancelar" color="negative" :loading="processandoId !== null" @click="confirmarCancelamento" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = 'http://localhost:3000/api'

const meuId = ref(null)
const tipoUsuario = ref('')
const encomendas = ref([])
const avaliacoesPorFrete = ref({})
const carregando = ref(false)
const aba = ref('remetente')
const processandoId = ref(null)

const ehSolicitante = computed(() => ['CLIENTE', 'AMBOS', 'ADMIN'].includes(tipoUsuario.value))
const ehMotorista = computed(() => ['MOTORISTA', 'AMBOS', 'ADMIN'].includes(tipoUsuario.value))

const dialogCancelar = ref(false)
const encomendaParaCancelar = ref(null)

const dialogAvaliar = ref(false)
const encomendaAvaliar = ref(null)
const avaliacao = reactive({ nota: 0, comentario: '' })
const enviandoAvaliacao = ref(false)

const fretesRemetente = computed(() => encomendas.value.filter((e) => e.cliente_id === meuId.value))
const fretesTransportador = computed(() => encomendas.value.filter((e) => e.motorista_id === meuId.value))
const listaAtual = computed(() => (aba.value === 'remetente' ? fretesRemetente.value : fretesTransportador.value))

const STATUS = {
  DISPONIVEL: { rotulo: 'Disponível', cor: 'blue-grey', icone: 'inventory_2' },
  AGUARDANDO_PROPOSTAS: { rotulo: 'Aguardando propostas', cor: 'orange', icone: 'hourglass_empty' },
  ACEITA: { rotulo: 'Aguardando coleta', cor: 'teal', icone: 'event_available' },
  EM_TRANSITO: { rotulo: 'Em trânsito', cor: 'blue', icone: 'local_shipping' },
  ENTREGUE: { rotulo: 'Entregue', cor: 'green', icone: 'task_alt' },
  CANCELADA: { rotulo: 'Cancelada', cor: 'grey', icone: 'cancel' },
}

function rotuloStatus(s) { return STATUS[s]?.rotulo || s }
function corStatus(s) { return STATUS[s]?.cor || 'grey' }
function iconeStatus(s) { return STATUS[s]?.icone || 'inventory_2' }

function formatarLocal(cidade, logradouro) {
  return cidade || logradouro || 'Não informado'
}

function formatarData(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('pt-BR')
}

function formatarValor(v) {
  if (v === null || v === undefined || v === '') return 'A combinar'
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function carregarTudo() {
  carregando.value = true
  try {
    const [resMe, resFretes] = await Promise.all([
      fetch(`${API_URL}/usuarios/me`, { credentials: 'include' }),
      fetch(`${API_URL}/encomendas/minhas`, { credentials: 'include' }),
    ])
    const me = await resMe.json()
    const fretes = await resFretes.json()
    if (!resMe.ok) throw new Error(me.erro || 'Erro ao identificar o usuário.')
    if (!resFretes.ok) throw new Error(fretes.erro || 'Erro ao carregar seus fretes.')

    meuId.value = me.id
    tipoUsuario.value = me.tipo || ''
    encomendas.value = fretes

    // aba inicial conforme o papel
    aba.value = ehSolicitante.value ? 'remetente' : 'transportador'

    await carregarAvaliacoes()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    carregando.value = false
  }
}

async function atualizarStatus(enc, novoStatus) {
  processandoId.value = enc.id
  try {
    const res = await fetch(`${API_URL}/encomendas/${enc.id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao atualizar o frete.')

    enc.status = data.status
    $q.notify({ type: 'positive', message: 'Frete atualizado com sucesso!', position: 'top-right' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    processandoId.value = null
  }
}

function avaliacoesDe(enc) {
  return avaliacoesPorFrete.value[enc.id] || []
}

async function carregarAvaliacoes() {
  const mapa = {}
  await Promise.all(
    encomendas.value.map(async (e) => {
      try {
        const r = await fetch(`${API_URL}/avaliacoes/encomenda/${e.id}`, { credentials: 'include' })
        mapa[e.id] = r.ok ? await r.json() : []
      } catch {
        mapa[e.id] = []
      }
    })
  )
  avaliacoesPorFrete.value = mapa
  // se o usuário já avaliou este frete, esconde o botão "Avaliar"
  encomendas.value.forEach((e) => {
    if ((mapa[e.id] || []).some((a) => a.avaliador_id === meuId.value)) e._avaliado = true
  })
}

function pedirAvaliacao(enc) {
  encomendaAvaliar.value = enc
  avaliacao.nota = 0
  avaliacao.comentario = ''
  dialogAvaliar.value = true
}

async function enviarAvaliacao() {
  const enc = encomendaAvaliar.value
  if (!enc) return
  if (!avaliacao.nota) {
    $q.notify({ type: 'negative', message: 'Escolha uma nota de 1 a 5.', position: 'top-right' })
    return
  }

  // quem avalia o quê: remetente avalia o motorista; transportador avalia o cliente
  const avaliadoId = aba.value === 'remetente' ? enc.motorista_id : enc.cliente_id
  if (!avaliadoId) {
    $q.notify({ type: 'negative', message: 'Este frete não tem a outra parte definida.', position: 'top-right' })
    return
  }

  enviandoAvaliacao.value = true
  try {
    const res = await fetch(`${API_URL}/avaliacoes/encomenda/${enc.id}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avaliado_id: avaliadoId, nota: avaliacao.nota, comentario: avaliacao.comentario || null }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao enviar avaliação.')

    enc._avaliado = true
    $q.notify({ type: 'positive', message: 'Avaliação enviada. Obrigado!', position: 'top-right' })
    dialogAvaliar.value = false
    await carregarAvaliacoes()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    enviandoAvaliacao.value = false
  }
}

function pedirCancelamento(enc) {
  encomendaParaCancelar.value = enc
  dialogCancelar.value = true
}

async function confirmarCancelamento() {
  const enc = encomendaParaCancelar.value
  if (!enc) return
  await atualizarStatus(enc, 'CANCELADA')
  dialogCancelar.value = false
  encomendaParaCancelar.value = null
}

onMounted(carregarTudo)
</script>
