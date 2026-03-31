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
      <q-scroll-area class="fit">
        <q-list padding>
          
          <q-item>
            <q-item-section avatar>
              <q-btn flat dense round icon="local_shipping" aria-label="Menu" @click="toggleMiniState" />
            </q-item-section>
          </q-item>

          <EssentialLink
            v-for="link in essentialLinks"
            :key="link.title"
            v-bind="link"
          />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'




const essentialLinks = [
  { title: 'Dashboard', icon: 'dashboard', link: 'https://quasar.dev' },
  { title: 'Solicitar frete', icon: 'add_box', link: 'https://github.com/quasarframework' },
  { title: 'Oferece frete', icon: 'sell', link: 'https://chat.quasar.dev' },
  { title: 'Meus fretes', icon: 'record_voice_over', link: 'https://forum.quasar.dev' },
  { title: 'Mensagens', icon: 'rss_feed', link: 'https://twitter.com/quasarframework' }
]

const drawer = ref(true)
const miniState = ref(false)

function toggleMiniState () {
  miniState.value = !miniState.value
}
</script>