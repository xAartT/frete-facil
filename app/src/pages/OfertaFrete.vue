<template>
  <q-page class="q-pa-lg" style="background-color: #F8FAFC;">

    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold text-grey-9">Mural de encomendas</div>
      <q-btn flat round icon="refresh" color="grey-7" @click="carregarEncomendas">
        <q-tooltip>Atualizar</q-tooltip>
      </q-btn>
    </div>

    <!-- Busca -->
    <q-card flat bordered class="q-pa-md q-mb-lg rounded-borders">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md">
          <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Origem</div>
          <q-input outlined dense v-model="filtroOrigem" placeholder="Ex: São Paulo, SP" clearable>
            <template v-slot:prepend><q-icon name="place" color="grey-6" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md">
          <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Destino</div>
          <q-input outlined dense v-model="filtroDestino" placeholder="Ex: Campinas, SP" clearable>
            <template v-slot:prepend><q-icon name="flag" color="grey-6" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-auto">
          <q-btn unelevated color="primary" icon="search" label="Buscar Encomendas" class="full-width" @click="aplicarBusca" />
        </div>
      </div>
    </q-card>

    <!-- Cabeçalho da lista -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-bold text-grey-9">Encomendas Disponíveis</div>
      <div class="text-caption text-grey-6">{{ encomendasFiltradas.length }} encontrada(s)</div>
    </div>

    <!-- Carregando -->
    <div v-if="carregando" class="row q-col-gutter-md">
      <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="q-pa-md rounded-borders">
          <q-skeleton type="QChip" />
          <q-skeleton type="text" class="text-subtitle1 q-mt-sm" />
          <q-skeleton type="text" width="60%" />
          <q-skeleton type="rect" height="40px" class="q-mt-md" />
        </q-card>
      </div>
    </div>

    <!-- Vazio -->
    <q-banner v-else-if="encomendasFiltradas.length === 0" class="bg-white text-grey-7 rounded-borders" rounded>
      <template v-slot:avatar><q-icon name="inbox" color="grey-5" /></template>
      Nenhuma encomenda disponível no momento.
    </q-banner>

    <!-- Grid de encomendas -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="enc in encomendasFiltradas" :key="enc.id" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="column full-height rounded-borders">

          <q-card-section class="col">
            <div class="row items-center q-gutter-md q-mb-sm">
              <q-avatar square size="40px" color="blue-1" text-color="primary" icon="inventory_2" />
              <div>
                <div class="text-caption text-grey-6">Peso</div>
                <div class="text-body2 text-weight-medium text-grey-9">{{ enc.peso ? enc.peso + ' kg' : '—' }}</div>
              </div>
              <div>
                <div class="text-caption text-grey-6">Distância</div>
                <div class="text-body2 text-weight-medium text-grey-9">{{ distanciaDe(enc) ? distanciaDe(enc) + ' km' : '—' }}</div>
              </div>
              <q-space />
              <q-chip dense color="blue-1" text-color="primary" class="text-caption q-ma-none">
                {{ tempoRelativo(enc.data_criacao) }}
              </q-chip>
            </div>

            <div class="text-subtitle2 text-weight-bold text-grey-9">
              {{ formatarLocal(enc.coleta_cidade, enc.coleta_logradouro) }}
              <q-icon name="arrow_forward" size="xs" class="q-mx-xs text-grey-6" />
              {{ formatarLocal(enc.entrega_cidade, enc.entrega_logradouro) }}
            </div>

            <div class="text-body2 text-grey-7 q-mt-xs">
              {{ enc.descricao }}
            </div>

            <div class="row items-center q-mt-md">
              <q-avatar size="28px" color="grey-3" text-color="grey-8" class="q-mr-sm">
                {{ inicialNome(enc.cliente_nome) }}
              </q-avatar>
              <div>
                <div class="text-caption text-weight-medium text-grey-9">{{ enc.cliente_nome || 'Solicitante' }}</div>
                <div class="text-caption text-grey-6">Solicitante</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none column q-gutter-sm">
            <q-btn outline color="grey-7" icon="visibility" label="Ver detalhes" class="full-width" @click="abrirDetalhes(enc)" />
            <q-btn unelevated color="primary" icon="local_shipping" label="Fazer Proposta" class="full-width" @click="abrirProposta(enc)" />
          </q-card-section>

        </q-card>
      </div>
    </div>

    <!-- Dialog: Fazer Proposta -->
    <q-dialog v-model="dialogProposta">
      <q-card style="min-width: 350px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Fazer Proposta</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="encomendaSelecionada" class="q-pt-sm">
          <div class="text-body2 text-grey-8 q-mb-md">
            {{ formatarLocal(encomendaSelecionada.coleta_cidade, encomendaSelecionada.coleta_logradouro) }}
            <q-icon name="arrow_forward" size="xs" class="q-mx-xs text-grey-6" />
            {{ formatarLocal(encomendaSelecionada.entrega_cidade, encomendaSelecionada.entrega_logradouro) }}
          </div>

          <q-input
            outlined dense type="number" v-model="valorProposto"
            label="Valor da proposta" prefix="R$"
          />
          <q-input
            outlined dense type="textarea" v-model="mensagemProposta"
            label="Mensagem (opcional)" class="q-mt-md" autogrow
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Enviar Proposta" color="primary" :loading="enviando" @click="enviarProposta" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Detalhes da encomenda -->
    <q-dialog v-model="dialogDetalhes">
      <q-card style="min-width: 360px; max-width: 90vw;" v-if="encomendaDetalhe">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalhes da encomenda</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div>
            <div class="text-caption text-weight-bold text-primary q-mb-xs">
              <q-icon name="place" size="xs" /> Coleta (Origem)
            </div>
            <div class="text-body2 text-grey-8">{{ enderecoCompleto(encomendaDetalhe, 'coleta') }}</div>
          </div>

          <div>
            <div class="text-caption text-weight-bold text-positive q-mb-xs">
              <q-icon name="flag" size="xs" /> Entrega (Destino)
            </div>
            <div class="text-body2 text-grey-8">{{ enderecoCompleto(encomendaDetalhe, 'entrega') }}</div>
          </div>

          <q-separator />

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="text-caption text-grey-6">Descrição</div>
              <div class="text-body2 text-grey-9">{{ encomendaDetalhe.descricao || '—' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Peso</div>
              <div class="text-body2 text-grey-9">{{ encomendaDetalhe.peso ? encomendaDetalhe.peso + ' kg' : '—' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Distância</div>
              <div class="text-body2 text-grey-9">{{ encomendaDetalhe.distancia != null ? encomendaDetalhe.distancia + ' km' : '—' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Veículo sugerido</div>
              <div class="text-body2 text-grey-9">{{ encomendaDetalhe.tipo_veiculo || '—' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Valor sugerido</div>
              <div class="text-body2 text-grey-9">{{ formatarValorDetalhe(encomendaDetalhe.valor_sugerido) }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Solicitante</div>
              <div class="text-body2 text-grey-9">{{ encomendaDetalhe.cliente_nome || '—' }}</div>
            </div>
            <div class="col-12" v-if="encomendaDetalhe.observacao">
              <div class="text-caption text-grey-6">Observação</div>
              <div class="text-body2 text-grey-9">{{ encomendaDetalhe.observacao }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = 'http://localhost:3000/api'

const meuId = ref(null)
const encomendas = ref([])
const carregando = ref(false)

// filtros (digitação) e busca aplicada (ao clicar em "Buscar")
const filtroOrigem = ref('')
const filtroDestino = ref('')
const buscaOrigem = ref('')
const buscaDestino = ref('')

const dialogProposta = ref(false)
const encomendaSelecionada = ref(null)

const dialogDetalhes = ref(false)
const encomendaDetalhe = ref(null)
const valorProposto = ref('')
const mensagemProposta = ref('')
const enviando = ref(false)

const encomendasFiltradas = computed(() => {
  return encomendas.value.filter((e) => {
    const origem = `${e.coleta_cidade || ''} ${e.coleta_logradouro || ''}`.toLowerCase()
    const destino = `${e.entrega_cidade || ''} ${e.entrega_logradouro || ''}`.toLowerCase()
    const okOrigem = !buscaOrigem.value || origem.includes(buscaOrigem.value.toLowerCase())
    const okDestino = !buscaDestino.value || destino.includes(buscaDestino.value.toLowerCase())
    const naoEhMinha = e.cliente_id !== meuId.value
    return okOrigem && okDestino && naoEhMinha
  })
})

function aplicarBusca() {
  buscaOrigem.value = filtroOrigem.value || ''
  buscaDestino.value = filtroDestino.value || ''
}

function formatarLocal(cidade, logradouro) {
  return cidade || logradouro || 'Não informado'
}

function inicialNome(nome) {
  return (nome || '?').charAt(0).toUpperCase()
}

function tempoRelativo(data) {
  if (!data) return ''
  const diff = Date.now() - new Date(data).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Agora'
  if (min < 60) return `Há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Há ${h}h`
  const d = Math.floor(h / 24)
  return `Há ${d}d`
}

async function carregarUsuario() {
  try {
    const res = await fetch(`${API_URL}/usuarios/me`, { credentials: 'include' })
    const data = await res.json()
    if (res.ok) meuId.value = data.id
  } catch {
    // se falhar, apenas não escondemos os botões das próprias encomendas
  }
}

async function carregarEncomendas() {
  carregando.value = true
  try {
    const res = await fetch(`${API_URL}/encomendas/disponiveis`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao carregar encomendas.')
    encomendas.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    carregando.value = false
  }
}

function distanciaDe(enc) {
  return enc.distancia != null ? enc.distancia : null
}

function abrirDetalhes(enc) {
  encomendaDetalhe.value = enc
  dialogDetalhes.value = true
}

function enderecoCompleto(enc, tipo) {
  const partes = [
    enc[`${tipo}_logradouro`],
    enc[`${tipo}_numero`],
    enc[`${tipo}_bairro`],
    enc[`${tipo}_cidade`],
    enc[`${tipo}_estado`],
    enc[`${tipo}_cep`] ? `CEP ${enc[`${tipo}_cep`]}` : null,
  ].filter(Boolean)
  return partes.length ? partes.join(', ') : 'Endereço não informado'
}

function formatarValorDetalhe(v) {
  if (v === null || v === undefined || v === '') return 'A combinar'
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function abrirProposta(enc) {
  encomendaSelecionada.value = enc
  valorProposto.value = enc.valor_sugerido || ''
  mensagemProposta.value = ''
  dialogProposta.value = true
}

async function enviarProposta() {
  if (!valorProposto.value) {
    $q.notify({ type: 'negative', message: 'Informe o valor da proposta.', position: 'top-right' })
    return
  }
  enviando.value = true
  try {
    const res = await fetch(`${API_URL}/encomendas/${encomendaSelecionada.value.id}/propostas`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor_proposto: Number(valorProposto.value),
        mensagem: mensagemProposta.value || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao enviar proposta.')

    // Só avisa por mensagem se o transportador escreveu algo (não bloqueia caso falhe)
    if (mensagemProposta.value && mensagemProposta.value.trim()) {
      await enviarMensagemProposta(encomendaSelecionada.value, Number(valorProposto.value), mensagemProposta.value)
    }

    $q.notify({ type: 'positive', message: 'Proposta enviada com sucesso!', position: 'top-right' })
    dialogProposta.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    enviando.value = false
  }
}

async function enviarMensagemProposta(enc, valor, mensagem) {
  const origem = formatarLocal(enc.coleta_cidade, enc.coleta_logradouro)
  const destino = formatarLocal(enc.entrega_cidade, enc.entrega_logradouro)
  const valorFmt = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  let texto = `📦 Nova proposta para o frete ${origem} → ${destino}: ${valorFmt}.`
  if (mensagem && mensagem.trim()) texto += ` Mensagem: "${mensagem.trim()}"`

  try {
    await fetch(`${API_URL}/mensagens`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinatario_id: enc.cliente_id, texto, encomenda_id: enc.id }),
    })
  } catch {
    // a proposta já foi registrada; falha ao notificar não deve travar o fluxo
  }
}

onMounted(async () => {
  await carregarUsuario()
  await carregarEncomendas()
})
</script>
