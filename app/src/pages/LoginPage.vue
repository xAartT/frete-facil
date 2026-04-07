<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="row items-stretch login-container">
        
        <div class="col-12 col-md-7 flex flex-center left-column relative-position">
          <div class="overlay absolute-full"></div> <div class="absolute-bottom-left q-pa-xl text-white left-text-container">
            <h1 class="text-h3 text-weight-bolder text-white leading-tight">
              Transporte colaborativo<br>e sem burocracias
            </h1>
          </div>
        </div>

        <div class="col-12 col-md-5 flex flex-center right-column bg-grey-1 q-pa-xl">
          <q-card unelevated class="login-card full-width flex-center">
            
            <q-card-section class="flex flex-center q-pb-xl">
              <q-img
                  src="../assets/LogoSemFundo.png"  fit="contain" style="width: 150px; height: 130px;" class="q-mb-sm"              />
              <div class="text-h4 text-weight-bolder text-black full-width text-center">Frete Fácil</div>
            </q-card-section>

            <q-card-section>
              <q-form class="q-gutter-y-lg">
                
                <div>
                  <label class="text-subtitle1 text-grey-8 text-weight-medium" required>Login</label>
                  <q-input 
                    outlined 
                    v-model="login" 
                    placeholder="Login" 
                    type="login" 
                    class="login-input"
                    dense
                    :rules="[val => !!val || 'O campo Login é obrigatório']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" class="text-grey-7" />
                    </template>
                  </q-input>
                </div>

                <div>
                  <label class="text-subtitle1 text-grey-8 text-weight-medium" required>Senha</label>
                  <q-input 
                    outlined
                    v-model="senha" 
                    placeholder="Senha" 
                    type="password" 
                    class="login-input"
                    dense
                    :rules="[val => !!val || 'O campo Senha é obrigatório']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="key" class="text-grey-7" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="visibility" class="text-grey-7 cursor-pointer" />
                    </template>
                  </q-input>
                </div>

                <q-card-actions class="q-px-none q-pt-lg flex-column items-stretch">
                  <q-btn 
                    style="border-radius: 12px;" outlined 
                    color="primary" 
                    size="lg" 
                    class="full-width q-mb-md" 
                    label="Entrar" 
                    @click="fazerLogin" 
                  />
                  <q-btn 
                    style="border-radius: 12px;" outlined
                    color="primary" 
                    size="lg" 
                    class="full-width no-shadow" 
                    label="Cadastre-se" 
                    @click="fazerCadastro"
                  />
                </q-card-actions>
              </q-form>
            </q-card-section>

          </q-card>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const login = ref('')
const senha = ref('')
const router = useRouter()
const $q = useQuasar()

async function fazerCadastro(){
  router.push('/cadastro')
}

async function fazerLogin() {
  try {
    $q.loading.show({ message: 'Validando credenciais...' })

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        login: login.value,  
        senha: senha.value  
      })
    })

    const data = await response.json()

    if (!response.ok) {

      throw new Error(data.mensagem || 'Erro ao fazer login.')
    }

    localStorage.setItem('access_token', data.accessToken)
    localStorage.setItem('refresh_token', data.refreshToken)
    
    
    localStorage.setItem('usuario_dados', JSON.stringify(data.usuario))
    
    $q.notify({
      type: 'positive',
      message: `Bem-vindo de volta, ${data.usuario.nome}!`, 
      position: 'top-right'
    })

    router.push('/')

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message,
      position: 'top-right',
      icon: 'warning'
    })
  } finally {
    $q.loading.hide()
  }
}

</script>

<style scoped>
.login-container {
  height: 100vh;
}

.left-column {
  background-image: url('../assets/ImgFundoLogin.png');
  background-size: cover;
  background-position: top center;
}

.overlay {
  background-color: rgba(0, 0, 0, 0.4);
}

.left-text-container h1 {
  font-size: 3rem;
  line-height: 1.1;
}

.right-column {
  height: 100vh;
}

.login-card {
  width: 450px;
  max-width: 90vw;
  background-color: transparent;
}

.login-input :deep(.q-field__control) {
  border-radius: 12px;
}

.leading-tight {
  line-height: 1.2;
}
</style>