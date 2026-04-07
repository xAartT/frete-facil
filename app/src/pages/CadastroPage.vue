<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center login-container bg-grey-1 q-pa-sm">
        
        <q-card class="login-card full-width bg-white shadow-2" style="border-radius: 12px; max-width: 700px;">
          
          <q-card-section class="q-pt-md pb-none">
            <div class="text-h5 text-weight-bold text-center text-primary">Crie sua conta</div>
          </q-card-section>

          <q-card-section>
            <q-form>
              
              <div class="row q-col-gutter-x-md q-col-gutter-y-sm">
                
                <div class="col-12">
                  <label class="text-subtitle2 text-grey-8 text-weight-medium">Nome completo <span class="text-red">*</span></label>
                  <q-input 
                    outlined 
                    v-model="nome" 
                    placeholder="Seu nome" 
                    class="login-input"
                    dense
                    :rules="[val => !!val || 'Obrigatório']"
                  >
                    <template v-slot:prepend><q-icon name="person" class="text-grey-7" /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="text-subtitle2 text-grey-8 text-weight-medium">Login <span class="text-red">*</span></label>
                  <q-input 
                    outlined
                    v-model="login" 
                    placeholder="Nome de usuário" 
                    class="login-input"
                    dense
                    :rules="[val => !!val || 'Obrigatório']"
                  >
                    <template v-slot:prepend><q-icon name="badge" class="text-grey-7" /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="text-subtitle2 text-grey-8 text-weight-medium">E-mail <span class="text-red">*</span></label>
                  <q-input 
                    outlined
                    v-model="email" 
                    placeholder="seu@email.com" 
                    type="email"
                    class="login-input"
                    dense
                    :rules="[
                      val => !!val || 'Obrigatório',
                      val => /.+@.+\..+/.test(val) || 'E-mail inválido'
                    ]"
                  >
                    <template v-slot:prepend><q-icon name="mail" class="text-grey-7" /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="text-subtitle2 text-grey-8 text-weight-medium">Data de nascimento <span class="text-red">*</span></label>
                  <q-input 
                    outlined
                    v-model="dataNascimento" 
                    placeholder="DD/MM/AAAA" 
                    mask="##/##/####"
                    class="login-input"
                    dense
                    :rules="[val => !!val || 'Obrigatório']"
                  >
                    <template v-slot:prepend><q-icon name="event" class="text-grey-7" /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6 flex column justify-start">
                  <label class="text-subtitle2 text-grey-8 text-weight-medium">Tipo de perfil <span class="text-red">*</span></label>
                  <div class="q-gutter-sm flex items-center q-mt-none" style="height: 40px;">
                    <q-radio v-model="tipoUsuario" val="ambos" label="Ambos" color="primary" dense />
                    <q-radio v-model="tipoUsuario" val="solicitante" label="Solicitante" color="primary" dense />
                    <q-radio v-model="tipoUsuario" val="prestador" label="Prestador" color="primary" dense />
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="text-subtitle2 text-grey-8 text-weight-medium">Senha <span class="text-red">*</span></label>
                  <q-input 
                    outlined
                    v-model="senha" 
                    placeholder="Senha" 
                    type="password" 
                    class="login-input"
                    dense
                    :rules="[val => !!val || 'Obrigatório']"
                  >
                    <template v-slot:prepend><q-icon name="key" class="text-grey-7" /></template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="text-subtitle2 text-grey-8 text-weight-medium">Confirmar senha <span class="text-red">*</span></label>
                  <q-input 
                    outlined
                    v-model="confirmarSenha" 
                    placeholder="Repita sua senha" 
                    type="password" 
                    class="login-input"
                    dense
                    :rules="[
                      val => !!val || 'Obrigatório',
                      val => val === senha || 'Senhas não combinam'
                    ]"
                  >
                    <template v-slot:prepend><q-icon name="key" class="text-grey-7" /></template>
                  </q-input>
                </div>
              </div>

              <q-card-actions class="q-px-none q-pt-sm flex-column items-stretch">
                <q-btn 
                  style="border-radius: 12px;" 
                  unelevated 
                  color="primary" 
                  size="lg" 
                  class="full-width" 
                  label="Salvar" 
                  @click="salvarCadastro" 
                />
              </q-card-actions>

            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const nome = ref('')
const login = ref('')
const email = ref('')
const dataNascimento = ref('')
const tipoUsuario = ref('ambos')
const senha = ref('')
const confirmarSenha = ref('')

async function salvarCadastro() {
  const payload = {
    nome: nome.value,
    login: login.value,
    email: email.value,
    dataNascimento: dataNascimento.value,
    tipo: 'ADMIN',//tipoUsuario.value,
    senha: senha.value
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const erro = await response.json()
      throw new Error(erro.mensagem || 'Falha ao realizar cadastro.')
    }

    $q.notify({
      color: 'positive',
      icon: 'check',
      message: 'Conta criada com sucesso!'
    })

    router.push('/login')

  } catch (error) {
    $q.notify({
      color: 'negative',
      icon: 'warning',
      message: error.message
    })
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
}

.login-input :deep(.q-field__control) {
  border-radius: 12px;
}
</style>