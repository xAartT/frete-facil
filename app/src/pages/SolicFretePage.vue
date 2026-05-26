<template>
  <q-page padding class="bg-blue-grey-1" style="min-height: 100vh;">
    
    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h5 text-weight-bold text-grey-9">Nova Solicitação de Frete</div>
      <div class="text-grey-6 flex items-center text-caption">
        <q-icon name="notifications_none" size="sm" class="q-mr-sm cursor-pointer" />
        <span class="q-ml-sm q-pl-sm" style="border-left: 1px solid #ccc;">ID Solicitação: #8291-B</span>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      
      <div class="col-12 col-md-6 column">
        <q-card flat bordered class="col bg-grey-3 rounded-borders overflow-hidden" style="min-height: 400px; position: relative; z-index: 1;">
          <div ref="mapContainer" style="width: 100%; height: 100%;"></div>

          <q-btn
            round color="white" text-color="primary" icon="fullscreen"
            class="absolute-top-right q-ma-md shadow-2" style="z-index: 1000;"
            @click="mapaExpandido = true"
          >
            <q-tooltip>Expandir Mapa</q-tooltip>
          </q-btn>
        </q-card>

        <q-banner rounded class="bg-blue-1 text-blue-9 q-mt-md border-blue-2" style="border: 1px solid #bbdefb;">
          <template v-slot:avatar>
            <q-icon name="route" color="blue-8" />
          </template>
          <span class="text-caption">
            <span v-if="form.distancia" class="text-weight-bold text-body1">
              Distância total da rota: {{ form.distancia }} km <br/>
            </span>
            O mapa inicia na sua localização atual. Clique para marcar os pontos.
          </span>
        </q-banner>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-lg rounded-borders">
          <div class="text-h6 text-weight-bold text-grey-9">Detalhes do Frete</div>
          
          <div class="text-weight-medium text-grey-8 q-mt-md q-mb-xs text-caption">Endereço de Coleta (Origem)</div>
          <q-input outlined dense v-model="form.origem" placeholder="Clique no mapa..." readonly :loading="carregandoOrigem">
            <template v-slot:prepend><q-icon name="place" color="primary" /></template>
            <template v-slot:append v-if="form.origem">
              <q-icon name="close" @click="limparPonto('origem')" class="cursor-pointer" />
            </template>
          </q-input>

          <div class="text-weight-medium text-grey-8 q-mt-md q-mb-xs text-caption">Endereço de Entrega (Destino)</div>
          <q-input outlined dense v-model="form.destino" placeholder="Clique no mapa..." readonly :loading="carregandoDestino">
            <template v-slot:prepend><q-icon name="flag" color="positive" /></template>
            <template v-slot:append v-if="form.destino">
              <q-icon name="close" @click="limparPonto('destino')" class="cursor-pointer" />
            </template>
          </q-input>

          <div class="row q-col-gutter-sm q-mt-md">
            <div class="col-12 col-sm-4">
              <div class="text-weight-medium text-grey-8 q-mb-xs text-caption">Distância (km)</div>
              <q-input outlined dense v-model="form.distancia" readonly placeholder="Auto">
                <template v-slot:prepend><q-icon name="straighten" color="grey-5" size="sm" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <div class="text-weight-medium text-grey-8 q-mb-xs text-caption">Peso Estimado (kg)</div>
              <q-input outlined dense v-model="form.peso" placeholder="Ex: 450" />
            </div>
            <div class="col-12 col-sm-4">
              <div class="text-weight-medium text-grey-8 q-mb-xs text-caption">Tipo de Veículo</div>
              <q-select outlined dense v-model="form.veiculo" :options="opcoesVeiculos" label="Selecione..." />
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="mapaExpandido" maximized transition-show="fade" transition-hide="fade" @show="recalcularTamanhoMapa">
      <q-card class="bg-white column no-wrap">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>Selecione a Rota no Mapa</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="col q-pa-none">
          <div ref="mapContainerExpanded" style="width: 100%; height: 100%;"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const mapContainer = ref(null)
const mapContainerExpanded = ref(null)
const mapaExpandido = ref(false)
let map = null

let markerOrigem = null
let markerDestino = null
let polylineRota = null

const carregandoOrigem = ref(false)
const carregandoDestino = ref(false)

const form = reactive({
  origem: '',
  destino: '',
  distancia: '', // Nova variável para guardar a quilometragem
  peso: '',
  veiculo: null,
  aceitaTermos: false
})

const opcoesVeiculos = ['Moto', 'Fiorino', 'Caminhão Toco', 'Truck', 'Carreta']

// Função para buscar endereço pelo clique
async function buscarEndereco(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    const data = await res.json()
    return data.display_name
  } catch { return `${lat.toFixed(4)}, ${lng.toFixed(4)}` }
}

// NOVA FUNÇÃO: Busca a rota real pelas estradas usando OSRM
async function traçarRotaNasRuas(origemLatLng, destinoLatLng) {
  // A API OSRM pede na ordem: longitude, latitude
  const url = `https://router.project-osrm.org/route/v1/driving/${origemLatLng.lng},${origemLatLng.lat};${destinoLatLng.lng},${destinoLatLng.lat}?overview=full&geometries=geojson`
  
  try {
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.routes && data.routes.length > 0) {
      const rota = data.routes[0]
      
      // Converte a distância de metros para quilômetros com 1 casa decimal
      form.distancia = (rota.distance / 1000).toFixed(1)
      
      // OSRM retorna [lng, lat], o Leaflet precisa de [lat, lng], então invertemos
      const coordenadas = rota.geometry.coordinates.map(coord => [coord[1], coord[0]])
      
      // Desenha a linha sólida azul seguindo as ruas
      polylineRota = L.polyline(coordenadas, { color: '#1976D2', weight: 4 }).addTo(map)
      
      // Ajusta o zoom para mostrar a viagem inteira
      map.fitBounds(polylineRota.getBounds(), { padding: [50, 50] })
    }
  } catch (erro) {
    console.error("Erro ao traçar rota:", erro)
  }
}

function limparPonto(tipo) {
  if (tipo === 'origem') {
    if (markerOrigem) map.removeLayer(markerOrigem)
    markerOrigem = null
    form.origem = ''
  } else {
    if (markerDestino) map.removeLayer(markerDestino)
    markerDestino = null
    form.destino = ''
  }
  if (polylineRota) {
    map.removeLayer(polylineRota)
    polylineRota = null
  }
  form.distancia = '' // Limpa a quilometragem também
}

async function tratarCliqueMapa(e) {
  const { lat, lng } = e.latlng

  if (!markerOrigem) {
    markerOrigem = L.circleMarker([lat, lng], { color: '#1976D2', radius: 8, fillOpacity: 1 }).addTo(map)
    carregandoOrigem.value = true
    form.origem = await buscarEndereco(lat, lng)
    carregandoOrigem.value = false
  } else if (!markerDestino) {
    markerDestino = L.circleMarker([lat, lng], { color: '#21BA45', radius: 8, fillOpacity: 1 }).addTo(map)
    carregandoDestino.value = true
    form.destino = await buscarEndereco(lat, lng)
    carregandoDestino.value = false
    
    // Chama a nova função em vez de desenhar a linha reta
    await traçarRotaNasRuas(markerOrigem.getLatLng(), markerDestino.getLatLng())
  }
}

function initMap(container) {
  if (map) map.remove()
  
  // Iniciamos com uma visão geral do Brasil como fallback
  map = L.map(container).setView([-15.78, -47.92], 4)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  map.on('click', tratarCliqueMapa)

  // Recarrega marcadores se existirem
  if (markerOrigem) markerOrigem.addTo(map)
  if (markerDestino) markerDestino.addTo(map)
  if (polylineRota) polylineRota.addTo(map)

  // --- NOVA LÓGICA DE LOCALIZAÇÃO MAIS FORTE ---
  
  // 1. Ouvir quando a localização for encontrada
  map.on('locationfound', (e) => {
    console.log("Localização encontrada!", e.latlng)
    
    // Forçamos o zoom exatamente no ponto encontrado
    map.setView(e.latlng, 16) 
    
    // Adiciona o círculo de precisão
    L.circle(e.latlng, { 
      radius: e.accuracy / 2, 
      color: '#1976D2', 
      fillOpacity: 0.1 
    }).addTo(map)
  })

  // 2. Ouvir se houver erro (Permissão negada, Timeout, etc)
  map.on('locationerror', (e) => {
    console.warn("Não foi possível obter a localização:", e.message)
    // Se falhar, você pode opcionalmente avisar o usuário com um Notify do Quasar
  })

  // 3. Disparar a busca
  map.locate({ 
    setView: false, // Vamos fazer o setView manualmente no 'locationfound' acima
    enableHighAccuracy: true,
    timeout: 10000 // Espera até 10 segundos pela resposta do GPS
  })
}

async function recalcularTamanhoMapa() {
  await nextTick()
  initMap(mapContainerExpanded.value)
  map.invalidateSize()
}

onMounted(() => {
  initMap(mapContainer.value)
})
</script>

<style scoped>
:deep(.q-field--outlined .q-field__control) { background-color: #fff; }
</style>