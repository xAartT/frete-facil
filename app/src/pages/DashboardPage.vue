<template>
  <q-page class="q-pa-lg" style="background-color: #F8FAFC;">

    <!-- Saudação -->
    <div class="text-h5 text-weight-bold text-grey-9 q-mb-lg">
      Olá, {{ nome || 'bem-vindo' }}
    </div>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="text-subtitle1 text-weight-bold text-grey-9">Fretes por status</q-card-section>
          <q-separator />
          <q-card-section>
            <v-chart v-if="encomendas.length" :option="opcoesPizza" autoresize style="height: 300px;" />
            <div v-else class="flex flex-center text-grey-5" style="height: 300px;">Sem dados ainda.</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-borders">
          <q-card-section class="text-subtitle1 text-weight-bold text-grey-9">Fretes por mês</q-card-section>
          <q-separator />
          <q-card-section>
            <v-chart v-if="encomendas.length" :option="opcoesBarra" autoresize style="height: 300px;" />
            <div v-else class="flex flex-center text-grey-5" style="height: 300px;">Sem dados ainda.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Resumo de entregas -->
    <q-card flat bordered class="rounded-borders">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold text-grey-9">Resumo de Entregas Atuais</div>
        <q-btn flat dense no-caps color="primary" label="Ver tudo" to="/meus-fretes" />
      </q-card-section>

      <q-separator />

      <div v-if="carregando" class="q-pa-md">
        <q-skeleton type="text" v-for="n in 3" :key="n" class="q-mb-sm" />
      </div>

      <q-banner v-else-if="resumo.length === 0" class="bg-white text-grey-7">
        <template v-slot:avatar><q-icon name="inbox" color="grey-5" /></template>
        Nenhuma entrega em andamento.
      </q-banner>

      <q-list v-else separator>
        <q-item v-for="enc in resumo" :key="enc.id">
          <q-item-section side class="text-primary text-weight-bold">#{{ enc.id }}</q-item-section>
          <q-item-section>{{ formatarLocal(enc.entrega_cidade, enc.entrega_logradouro) }}</q-item-section>
          <q-item-section side>
            <q-chip dense :color="`${corStatus(enc.status)}-1`" :text-color="`${corStatus(enc.status)}-9`" class="text-caption text-weight-bold">
              {{ rotuloStatus(enc.status) }}
            </q-chip>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="visibility" color="grey-6" to="/meus-fretes">
              <q-tooltip>Ver em Meus Fretes</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, PieChart, BarChart, TooltipComponent, LegendComponent, GridComponent])

const $q = useQuasar()
const API_URL = 'http://localhost:3000/api'

const nome = ref('')
const encomendas = ref([])
const carregando = ref(false)

const STATUS = {
  DISPONIVEL: { rotulo: 'Disponível', cor: 'blue-grey', hex: '#607D8B' },
  AGUARDANDO_PROPOSTAS: { rotulo: 'Aguardando propostas', cor: 'orange', hex: '#F2C037' },
  ACEITA: { rotulo: 'Aceita', cor: 'teal', hex: '#009688' },
  EM_TRANSITO: { rotulo: 'Em trânsito', cor: 'blue', hex: '#1976D2' },
  ENTREGUE: { rotulo: 'Entregue', cor: 'green', hex: '#21BA45' },
  CANCELADA: { rotulo: 'Cancelada', cor: 'grey', hex: '#9E9E9E' },
}
function rotuloStatus(s) { return STATUS[s]?.rotulo || s }
function corStatus(s) { return STATUS[s]?.cor || 'grey' }
function formatarLocal(cidade, logradouro) { return cidade || logradouro || 'Não informado' }

const resumo = computed(() =>
  encomendas.value.filter((e) => !['ENTREGUE', 'CANCELADA'].includes(e.status)).slice(0, 5)
)

// Gráfico de rosca: contagem por status
const opcoesPizza = computed(() => {
  const contagem = {}
  encomendas.value.forEach((e) => { contagem[e.status] = (contagem[e.status] || 0) + 1 })
  const dados = Object.keys(contagem).map((s) => ({
    value: contagem[s],
    name: rotuloStatus(s),
    itemStyle: { color: STATUS[s]?.hex || '#90A4AE' },
  }))
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      name: 'Status', type: 'pie', radius: ['45%', '70%'],
      avoidLabelOverlap: true, label: { show: false }, data: dados,
    }],
  }
})

// Gráfico de barras: fretes criados por mês
const opcoesBarra = computed(() => {
  const meses = {}
  encomendas.value.forEach((e) => {
    const d = new Date(e.data_criacao)
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    meses[chave] = (meses[chave] || 0) + 1
  })
  const chaves = Object.keys(meses).sort()
  const rotulos = chaves.map((k) => { const [a, m] = k.split('-'); return `${m}/${a}` })
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 35, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: rotulos },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{ type: 'bar', data: chaves.map((k) => meses[k]), itemStyle: { color: '#1976D2', borderRadius: [4, 4, 0, 0] } }],
  }
})

async function carregar() {
  carregando.value = true
  try {
    const [resMe, resFretes] = await Promise.all([
      fetch(`${API_URL}/usuarios/me`, { credentials: 'include' }),
      fetch(`${API_URL}/encomendas/minhas`, { credentials: 'include' }),
    ])
    const me = await resMe.json()
    const fretes = await resFretes.json()
    if (resMe.ok) nome.value = me.nome || ''
    if (resFretes.ok) encomendas.value = fretes
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>
