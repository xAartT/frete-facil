import * as enderecosService from '../services/enderecosService.js';

const trataErro = (res, resultado) => {
  if (resultado?.erro === 'nao_encontrado') return res.status(404).json({ erro: 'Endereço não encontrado.' });
  if (resultado?.erro === 'sem_permissao') return res.status(403).json({ erro: 'Este endereço não pertence a você.' });
  if (resultado?.erro === 'sem_campos') return res.status(400).json({ erro: 'Nenhum campo válido enviado para atualização.' });
  return null;
};

export const listarDoUsuario = async (req, res) => {
  try {
    const enderecos = await enderecosService.listarDoUsuario(req.usuario.id);
    return res.json(enderecos);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno ao listar endereços.' + err });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const resultado = await enderecosService.buscarPorId(req.params.id, req.usuario.id);
    const erro = trataErro(res, resultado);
    if (erro) return erro;
    return res.json(resultado);
  } catch {
    return res.status(500).json({ erro: 'Erro interno ao buscar endereço.' });
  }
};

export const criar = async (req, res) => {
  try {
    const endereco = await enderecosService.criar({ ...req.body, usuario_id: req.usuario.id });
    return res.status(201).json(endereco);
  } catch (err) {
    if (err.code === '23503') return res.status(404).json({ erro: 'Usuário não encontrado.' });
    return res.status(500).json({ erro: 'Erro interno ao criar endereço.' });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ erro: 'Informe o id do endereço na URL.' });

    const resultado = await enderecosService.atualizar(id, req.usuario.id, req.body);
    const erro = trataErro(res, resultado);
    if (erro) return erro;
    return res.json(resultado);
  } catch {
    return res.status(500).json({ erro: 'Erro interno ao atualizar endereço.' });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ erro: 'Informe o id do endereço na URL.' });

    const resultado = await enderecosService.deletar(id, req.usuario.id);
    const erro = trataErro(res, resultado);
    if (erro) return erro;
    return res.status(204).send();
  } catch {
    return res.status(500).json({ erro: 'Erro interno ao deletar endereço.' });
  }
};