import * as usuariosService from '../services/usuariosService.js';

export async function meuPerfil(req, res) {
  try {
    const usuario = await usuariosService.buscarPorId(req.usuario.id);
    return res.status(200).json(usuario);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function listar(req, res) {
  try {
    const usuarios = await usuariosService.listar();
    return res.status(200).json(usuarios);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function buscarPorId(req, res) {
  try {
    const usuario = await usuariosService.buscarPorId(parseInt(req.params.id));
    return res.status(200).json(usuario);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function atualizar(req, res) {
  try {
    const alvo = parseInt(req.params.id);

    if (req.usuario.tipo !== 'ADMIN' && req.usuario.id !== alvo) {
      return res.status(403).json({ erro: 'Sem permissão para editar este usuário.' });
    }

    const usuario = await usuariosService.atualizar(alvo, req.body);
    return res.status(200).json(usuario);
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function alterarSenha(req, res) {
  try {
    await usuariosService.alterarSenha(req.usuario.id, req.body);
    return res.status(200).json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function deletar(req, res) {
  try {
    await usuariosService.deletar(parseInt(req.params.id));
    return res.status(200).json({ mensagem: 'Usuário removido com sucesso.' });
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}