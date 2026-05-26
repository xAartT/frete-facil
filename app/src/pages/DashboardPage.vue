<template>
  <q-page class="column flex-center" style="background-color: #e0e0e0">
    <div class="text-h4 text-weight-bold q-mb-xl">Dashboard com ECharts!</div>

    <q-card bordered class="shadow-3 q-pa-md" style="width: 100%; max-width: 450px">
      <q-card-section>
        <div class="text-h6 text-center text-grey-8">Status dos Fretes</div>
      </q-card-section>

      <q-card-section>
        <v-chart
          class="chart"
          :option="opcoesDoGrafico"
          autoresize
          style="height: 300px; width: 100%"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// 1. Importações do ECharts (Pegamos só o que vamos usar para ficar leve)
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

// 2. Registrando os módulos
use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

// 3. A Configuração (O ECharts usa a palavra 'option' no singular, e tudo fica dentro dela)
const opcoesDoGrafico = ref({
  // Cores do Quasar (Positivo, Alerta, Negativo)
  color: ['#21BA45', '#F2C037', '#C10015'],

  // Caixinha que aparece ao passar o mouse
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)', // Mostra "Nome: Valor (Porcentagem%)"
  },

  // Legenda embaixo
  legend: {
    bottom: '0',
    left: 'center',
  },

  // Os dados e a configuração da Pizza ficam juntos no 'series'
  series: [
    {
      name: 'Fretes',
      type: 'pie',
      radius: '70%', // Tamanho da pizza
      data: [
        { value: 45, name: 'Concluídos' },
        { value: 25, name: 'Aguardando' },
        { value: 10, name: 'Cancelados' },
      ],
      // Dá um efeito de sombra na fatia quando passa o mouse
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
})
</script>
