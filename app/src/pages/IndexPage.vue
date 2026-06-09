<template>
  <q-page class="flex flex-center" style="background-color: #F8F9FA;">

  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { api } from 'src/boot/axios';

api.post("/auth/refresh");

export default defineComponent({
  name: 'IndexPage'
});
</script>
