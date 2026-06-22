<template>
  <q-page class="q-pa-lg" style="background-color: #F8FAFC;">

    <div class="text-h5 text-weight-bold text-grey-9">Configurações da Conta</div>
  

    <q-card flat bordered class="rounded-borders" style="max-width: 760px;">
      <q-tabs v-model="aba" align="left" active-color="primary" indicator-color="primary" class="text-grey-7" no-caps>
        <q-tab name="dados" label="Dados Pessoais" />
        <q-tab name="seguranca" label="Segurança" />
        <q-tab name="enderecos" label="Endereços" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="aba" animated>

        <!-- DADOS PESSOAIS -->
        <q-tab-panel name="dados">
          <q-form class="q-gutter-md" @submit.prevent="salvarDados">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Nome completo</div>
                <q-input outlined dense v-model="form.nome" :rules="[v => !!v || 'Obrigatório']" />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Login</div>
                <q-input outlined dense v-model="form.login" readonly hint="O login não pode ser alterado." />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">E-mail</div>
                <q-input outlined dense type="email" v-model="form.email"
                  :rules="[v => !!v || 'Obrigatório', v => /.+@.+\..+/.test(v) || 'E-mail inválido']" />
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Data de nascimento</div>
                <q-input outlined dense type="date" v-model="form.dataNascimento" />
              </div>
            </div>

            <div class="text-right">
              <q-btn unelevated color="primary" icon="save" label="Salvar Dados" type="submit" :loading="salvando" />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- SEGURANÇA -->
        <q-tab-panel name="seguranca">
          <q-form class="q-gutter-md" @submit.prevent="alterarSenha" style="max-width: 420px;">
            <div>
              <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Senha atual</div>
              <q-input outlined dense type="password" v-model="senha.atual" :rules="[v => !!v || 'Obrigatório']" />
            </div>
            <div>
              <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Nova senha</div>
              <q-input outlined dense type="password" v-model="senha.nova" :rules="[v => !!v || 'Obrigatório', v => v.length >= 4 || 'Mínimo 4 caracteres']" />
            </div>
            <div>
              <div class="text-caption text-weight-medium text-grey-8 q-mb-xs">Confirmar nova senha</div>
              <q-input outlined dense type="password" v-model="senha.confirmar" :rules="[v => v === senha.nova || 'As senhas não conferem']" />
            </div>
            <div class="text-right">
              <q-btn unelevated color="primary" icon="lock" label="Alterar Senha" type="submit" :loading="alterandoSenha" />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- ENDEREÇOS -->
        <q-tab-panel name="enderecos">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium text-grey-9">Meus endereços</div>
            <q-btn unelevated dense color="primary" icon="add" label="Novo" @click="abrirNovoEndereco" />
          </div>

          <div v-if="carregandoEnderecos" class="q-gutter-sm">
            <q-skeleton type="rect" height="56px" />
            <q-skeleton type="rect" height="56px" />
          </div>

          <q-banner v-else-if="enderecos.length === 0" class="bg-grey-1 text-grey-7 rounded-borders" rounded>
            Nenhum endereço cadastrado.
          </q-banner>

          <q-list v-else bordered separator class="rounded-borders">
            <q-item v-for="e in enderecos" :key="e.id">
              <q-item-section avatar><q-icon name="place" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ resumoEndereco(e) }}</q-item-label>
                <q-item-label caption v-if="e.cep">CEP {{ e.cep }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="delete" color="negative" @click="removerEndereco(e)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>

    <!-- Dialog: novo endereço -->
    <q-dialog v-model="dialogEndereco">
      <q-card style="min-width: 360px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Novo endereço</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="row q-col-gutter-sm">
          <div class="col-8"><q-input outlined dense v-model="novoEndereco.logradouro" label="Logradouro" /></div>
          <div class="col-4"><q-input outlined dense v-model="novoEndereco.numero" label="Número" /></div>
          <div class="col-6"><q-input outlined dense v-model="novoEndereco.bairro" label="Bairro" /></div>
          <div class="col-6"><q-input outlined dense v-model="novoEndereco.cep" label="CEP" mask="#####-###" /></div>
          <div class="col-8"><q-input outlined dense v-model="novoEndereco.cidade" label="Cidade" /></div>
          <div class="col-4"><q-input outlined dense v-model="novoEndereco.estado" label="UF" /></div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Salvar" color="primary" :loading="salvandoEndereco" @click="salvarEndereco" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const API_URL = 'http://localhost:3000/api'

const aba = ref('dados')
const meuId = ref(null)

const form = reactive({ nome: '', login: '', email: '', dataNascimento: '' })
const salvando = ref(false)

const senha = reactive({ atual: '', nova: '', confirmar: '' })
const alterandoSenha = ref(false)

const enderecos = ref([])
const carregandoEnderecos = ref(false)
const dialogEndereco = ref(false)
const salvandoEndereco = ref(false)
const novoEndereco = reactive({ logradouro: '', numero: '', bairro: '', cep: '', cidade: '', estado: '', pais: 'Brasil' })

async function carregarPerfil() {
  try {
    const res = await fetch(`${API_URL}/usuarios/me`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao carregar perfil.')
    meuId.value = data.id
    form.nome = data.nome || ''
    form.login = data.login || ''
    form.email = data.email || ''
    form.dataNascimento = data.data_nascimento ? String(data.data_nascimento).slice(0, 10) : ''
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  }
}

async function salvarDados() {
  salvando.value = true
  try {
    const res = await fetch(`${API_URL}/usuarios/${meuId.value}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        data_nascimento: form.dataNascimento || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao salvar dados.')
    $q.notify({ type: 'positive', message: 'Dados atualizados com sucesso!', position: 'top-right' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    salvando.value = false
  }
}

async function alterarSenha() {
  if (senha.nova !== senha.confirmar) {
    $q.notify({ type: 'negative', message: 'As senhas não conferem.', position: 'top-right' })
    return
  }
  alterandoSenha.value = true
  try {
    const res = await fetch(`${API_URL}/usuarios/me/senha`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha_atual: senha.atual, nova_senha: senha.nova }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao alterar senha.')
    $q.notify({ type: 'positive', message: 'Senha alterada com sucesso!', position: 'top-right' })
    senha.atual = ''
    senha.nova = ''
    senha.confirmar = ''
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    alterandoSenha.value = false
  }
}

async function carregarEnderecos() {
  carregandoEnderecos.value = true
  try {
    const res = await fetch(`${API_URL}/enderecos`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao carregar endereços.')
    enderecos.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    carregandoEnderecos.value = false
  }
}

function resumoEndereco(e) {
  return [e.logradouro, e.numero, e.bairro, e.cidade, e.estado].filter(Boolean).join(', ') || 'Endereço'
}

function abrirNovoEndereco() {
  Object.assign(novoEndereco, { logradouro: '', numero: '', bairro: '', cep: '', cidade: '', estado: '', pais: 'Brasil' })
  dialogEndereco.value = true
}

async function salvarEndereco() {
  salvandoEndereco.value = true
  try {
    const res = await fetch(`${API_URL}/enderecos`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...novoEndereco }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.erro || 'Erro ao salvar endereço.')
    $q.notify({ type: 'positive', message: 'Endereço adicionado!', position: 'top-right' })
    dialogEndereco.value = false
    carregarEnderecos()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  } finally {
    salvandoEndereco.value = false
  }
}

async function removerEndereco(e) {
  try {
    const res = await fetch(`${API_URL}/enderecos/${e.id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok && res.status !== 204) {
      const data = await res.json()
      throw new Error(data.erro || 'Erro ao remover endereço.')
    }
    $q.notify({ type: 'positive', message: 'Endereço removido.', position: 'top-right' })
    carregarEnderecos()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'top-right', icon: 'warning' })
  }
}

onMounted(() => {
  carregarPerfil()
  carregarEnderecos()
})
</script>
