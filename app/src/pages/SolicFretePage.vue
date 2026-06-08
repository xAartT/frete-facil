<template>
  <q-page padding class="bg-blue-grey-1" style="height: 100vh; overflow: hidden;">

    <div class="row justify-between items-center q-mb-lg">
      <div class="text-h5 text-weight-bold text-grey-9">Nova Solicitação de Frete</div>
      <div class="text-grey-6 flex items-center text-caption">
        <q-icon name="notifications_none" size="sm" class="q-mr-sm cursor-pointer" />
        <span class="q-ml-sm q-pl-sm" style="border-left: 1px solid #ccc;">ID Solicitação: #8291-B</span>
      </div>
    </div>

    <div class="row q-col-gutter-md">

      <!-- Card de campos: largura total, campos em linha -->
      <div class="col-12">
        <q-card flat bordered class="q-pa-lg rounded-borders">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6 text-weight-bold text-grey-9">Detalhes do Frete</div>
            <q-btn
              outline color="primary" label="Publicar solicitação" icon="send"
              :disable="!origemOpcao || !destinoOpcao"
              @click="publicarSolicitacao"
            />
          </div>

          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-4">
              <div class="text-weight-medium text-grey-8 q-mb-xs text-caption">Endereço de Coleta (Origem)</div>
              <q-select
                outlined dense
                v-model="origemOpcao"
                :options="origemSugestoes"
                use-input hide-selected fill-input
                input-debounce="600"
                placeholder="Pesquise ou clique no mapa..."
                :loading="carregandoOrigem"
                option-label="display_name"
                @filter="filtrarOrigem"
                @update:model-value="aoSelecionarOrigem"
              >
                <template v-slot:prepend><q-icon name="place" color="primary" /></template>
                <template v-slot:append>
                  <q-icon v-if="origemOpcao" name="close" @click.stop="limparPonto('origem')" class="cursor-pointer" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar><q-icon name="place" color="grey-6" size="xs" /></q-item-section>
                    <q-item-section><q-item-label lines="2" class="text-caption">{{ scope.opt.display_name }}</q-item-label></q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey text-caption">Nenhum resultado encontrado</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <div class="col-12 col-md-4">
              <div class="text-weight-medium text-grey-8 q-mb-xs text-caption">Endereço de Entrega (Destino)</div>
              <q-select
                outlined dense
                v-model="destinoOpcao"
                :options="destinoSugestoes"
                use-input hide-selected fill-input
                input-debounce="600"
                placeholder="Pesquise ou clique no mapa..."
                :loading="carregandoDestino"
                option-label="display_name"
                @filter="filtrarDestino"
                @update:model-value="aoSelecionarDestino"
              >
                <template v-slot:prepend><q-icon name="flag" color="positive" /></template>
                <template v-slot:append>
                  <q-icon v-if="destinoOpcao" name="close" @click.stop="limparPonto('destino')" class="cursor-pointer" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar><q-icon name="flag" color="grey-6" size="xs" /></q-item-section>
                    <q-item-section><q-item-label lines="2" class="text-caption">{{ scope.opt.display_name }}</q-item-label></q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="text-grey text-caption">Nenhum resultado encontrado</q-item-section></q-item>
                </template>
              </q-select>
            </div>

            <div class="col-6 col-sm-4 col-md">
              <div class="text-weight-medium text-grey-8 q-mb-xs text-caption">Distância (km)</div>
              <q-input outlined dense v-model="form.distancia" readonly placeholder="Auto">
                <template v-slot:prepend><q-icon name="straighten" color="grey-5" size="sm" /></template>
              </q-input>
            </div>
            <div class="col-6 col-sm-4 col-md">
              <div class="text-weight-medium text-grey-8 q-mb-xs text-caption">Peso Estimado (kg)</div>
              <q-input outlined dense v-model="form.peso" placeholder="Ex: 450" />
            </div>
            <div class="col-12 col-sm-4 col-md">
              <div class="text-weight-medium text-grey-8 q-mb-xs text-caption">Tipo de Veículo</div>
              <q-select outlined dense v-model="form.veiculo" :options="opcoesVeiculos" label="Selecione..." />
            </div>
          </div>
        </q-card>
      </div>

      <!-- Mapa: largura total -->
      <div class="col-12" style="position: relative;">
        <div ref="mapContainer" class="rounded-borders" style="width: 100%; height: calc(100vh - 270px); min-height: 300px; z-index: 1;"></div>

        <q-btn
          round color="white" text-color="primary" icon="fullscreen"
          class="absolute-top-right q-ma-md shadow-2" style="z-index: 1000; top: 0; right: 0;"
          @click="mapaExpandido = true"
        >
          <q-tooltip>Expandir Mapa</q-tooltip>
        </q-btn>

        <div v-if="form.distancia" class="absolute-bottom-left q-ma-md">
          <q-chip color="primary" text-color="white" icon="route" dense>
            {{ form.distancia }} km
          </q-chip>
        </div>
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

const origemOpcao = ref(null)
const destinoOpcao = ref(null)
const origemSugestoes = ref([])
const destinoSugestoes = ref([])

const form = reactive({
  distancia: '',
  peso: '',
  veiculo: null,
  aceitaTermos: false
})

const opcoesVeiculos = ['Moto', 'Carro de passeio', 'Picape', 'Furgão']

function publicarSolicitacao() {
  console.log('Publicando solicitação:', {
    origem: origemOpcao.value?.display_name,
    destino: destinoOpcao.value?.display_name,
    distancia: form.distancia,
    peso: form.peso,
    veiculo: form.veiculo,
  })
}

async function pesquisarNominatim(texto) {
  if (!texto || texto.length < 3) return []
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&limit=5&countrycodes=br&addressdetails=1`
    )
    return await res.json()
  } catch { return [] }
}

async function filtrarOrigem(val, update, abort) {
  if (val.length < 3) { abort(); return }
  const resultados = await pesquisarNominatim(val)
  update(() => { origemSugestoes.value = resultados })
}

async function filtrarDestino(val, update, abort) {
  if (val.length < 3) { abort(); return }
  const resultados = await pesquisarNominatim(val)
  update(() => { destinoSugestoes.value = resultados })
}

async function aoSelecionarOrigem(opcao) {
  if (!opcao) return
  const lat = parseFloat(opcao.lat)
  const lng = parseFloat(opcao.lon)

  if (markerOrigem) map.removeLayer(markerOrigem)
  if (polylineRota) { map.removeLayer(polylineRota); polylineRota = null; form.distancia = '' }

  markerOrigem = L.circleMarker([lat, lng], { color: '#1976D2', radius: 8, fillOpacity: 1 }).addTo(map)
  map.setView([lat, lng], 14)

  if (markerDestino) {
    await traçarRotaNasRuas(markerOrigem.getLatLng(), markerDestino.getLatLng())
  }
}

async function aoSelecionarDestino(opcao) {
  if (!opcao) return
  const lat = parseFloat(opcao.lat)
  const lng = parseFloat(opcao.lon)

  if (markerDestino) map.removeLayer(markerDestino)
  if (polylineRota) { map.removeLayer(polylineRota); polylineRota = null; form.distancia = '' }

  markerDestino = L.circleMarker([lat, lng], { color: '#21BA45', radius: 8, fillOpacity: 1 }).addTo(map)
  map.setView([lat, lng], 14)

  if (markerOrigem) {
    await traçarRotaNasRuas(markerOrigem.getLatLng(), markerDestino.getLatLng())
  }
}

async function buscarEndereco(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    const data = await res.json()
    return data.display_name
  } catch { return `${lat.toFixed(4)}, ${lng.toFixed(4)}` }
}

async function traçarRotaNasRuas(origemLatLng, destinoLatLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origemLatLng.lng},${origemLatLng.lat};${destinoLatLng.lng},${destinoLatLng.lat}?overview=full&geometries=geojson`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (data.routes && data.routes.length > 0) {
      const rota = data.routes[0]
      form.distancia = (rota.distance / 1000).toFixed(1)
      const coordenadas = rota.geometry.coordinates.map(coord => [coord[1], coord[0]])
      polylineRota = L.polyline(coordenadas, { color: '#1976D2', weight: 4 }).addTo(map)
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
    origemOpcao.value = null
  } else {
    if (markerDestino) map.removeLayer(markerDestino)
    markerDestino = null
    destinoOpcao.value = null
  }
  if (polylineRota) {
    map.removeLayer(polylineRota)
    polylineRota = null
  }
  form.distancia = ''
}

async function tratarCliqueMapa(e) {
  const { lat, lng } = e.latlng

  if (!markerOrigem) {
    markerOrigem = L.circleMarker([lat, lng], { color: '#1976D2', radius: 8, fillOpacity: 1 }).addTo(map)
    carregandoOrigem.value = true
    const nome = await buscarEndereco(lat, lng)
    carregandoOrigem.value = false
    origemOpcao.value = { display_name: nome, lat: String(lat), lon: String(lng) }
  } else if (!markerDestino) {
    markerDestino = L.circleMarker([lat, lng], { color: '#21BA45', radius: 8, fillOpacity: 1 }).addTo(map)
    carregandoDestino.value = true
    const nome = await buscarEndereco(lat, lng)
    carregandoDestino.value = false
    destinoOpcao.value = { display_name: nome, lat: String(lat), lon: String(lng) }

    await traçarRotaNasRuas(markerOrigem.getLatLng(), markerDestino.getLatLng())
  }
}

function initMap(container) {
  if (map) map.remove()

  map = L.map(container).setView([-15.78, -47.92], 4)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  map.on('click', tratarCliqueMapa)

  if (markerOrigem) markerOrigem.addTo(map)
  if (markerDestino) markerDestino.addTo(map)
  if (polylineRota) polylineRota.addTo(map)

  map.on('locationfound', (e) => {
    map.setView(e.latlng, 16)
    L.circle(e.latlng, { radius: e.accuracy / 2, color: '#1976D2', fillOpacity: 0.1 }).addTo(map)
  })

  map.on('locationerror', (e) => {
    console.warn("Não foi possível obter a localização:", e.message)
  })

  map.locate({ setView: false, enableHighAccuracy: true, timeout: 10000 })
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
