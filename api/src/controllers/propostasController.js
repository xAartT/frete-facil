import * as propostasService from '../services/propostasService.js';

export const criar = async (req, res) => {
  try {
    const { encomenda_id } = req.params;
    const { valor_proposto, mensagem } = req.body;

    if (!valor_proposto) {
      return res.status(400).json({ erro: 'Valor proposto é obrigatório.' });
    }

    const proposta = await propostasService.criar({
      encomenda_id: parseInt(encomenda_id),
      motorista_id: req.usuario.id,
      valor_proposto,
      mensagem,
    });

    return res.status(201).json(proposta);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Você já enviou uma proposta para esta encomenda.' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ erro: 'Encomenda não encontrada.' });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao criar proposta.' });
  }
};

export const listarPorEncomenda = async (req, res) => {
  try {
    const propostas = await propostasService.listarPorEncomenda(parseInt(req.params.encomenda_id));
    return res.json(propostas);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar propostas.' });
  }
};

export const minhasPropostas = async (req, res) => {
  try {
    const propostas = await propostasService.minhasPropostas(req.usuario.id);
    return res.json(propostas);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar suas propostas.' });
  }
};

export const aceitar = async (req, res) => {
  try {
    const encomenda = await propostasService.aceitar(parseInt(req.params.id), req.usuario.id);

    if (!encomenda) {
      return res.status(404).json({ erro: 'Proposta não encontrada.' });
    }

    return res.json({ mensagem: 'Proposta aceita com sucesso.', encomenda });
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ erro: err.mensagem });
    }
    if (err.status === 400) {
      return res.status(400).json({ erro: err.mensagem });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao aceitar proposta.' });
  }
};

export const cancelar = async (req, res) => {
  try {
    const proposta = await propostasService.cancelar(parseInt(req.params.id), req.usuario.id);

    if (!proposta) {
      return res.status(404).json({ erro: 'Proposta não encontrada.' });
    }

    return res.json({ mensagem: 'Proposta cancelada com sucesso.', proposta });
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ erro: err.mensagem });
    }
    if (err.status === 400) {
      return res.status(400).json({ erro: err.mensagem });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao cancelar proposta.' });
  }
};