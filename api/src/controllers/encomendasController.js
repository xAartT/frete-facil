import * as encomendasService from '../services/encomendasService.js';

export const criar = async (req, res) => {
  try {
    const encomenda = await encomendasService.criar({
      ...req.body,
      cliente_id: req.usuario.id,
    });
    return res.status(201).json(encomenda);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(404).json({ erro: 'Endereço ou usuário não encontrado.' });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao criar encomenda.' });
  }
};

export const listarDisponiveis = async (_req, res) => {
  try {
    const encomendas = await encomendasService.listarDisponiveis();
    return res.json(encomendas);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar encomendas disponíveis.' });
  }
};

export const minhasEncomendas = async (req, res) => {
  try {
    const encomendas = await encomendasService.minhasEncomendas(req.usuario.id);
    return res.json(encomendas);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar suas encomendas.' });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const encomenda = await encomendasService.buscarPorId(parseInt(req.params.id));
    if (!encomenda) {
      return res.status(404).json({ erro: 'Encomenda não encontrada.' });
    }
    return res.json(encomenda);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar encomenda.' });
  }
};

export const atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ erro: 'Status é obrigatório.' });
    }

    const encomenda = await encomendasService.atualizarStatus(
      parseInt(req.params.id),
      status,
      req.usuario.id
    );

    if (!encomenda) {
      return res.status(404).json({ erro: 'Encomenda não encontrada.' });
    }

    return res.json(encomenda);
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ erro: err.mensagem });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao atualizar encomenda.' });
  }
};

export const deletar = async (req, res) => {
  try {
    const resultado = await encomendasService.deletar(parseInt(req.params.id), req.usuario.id);
    if (!resultado) {
      return res.status(404).json({ erro: 'Encomenda não encontrada.' });
    }
    return res.status(204).send();
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ erro: err.mensagem });
    }
    return res.status(500).json({ erro: 'Erro ao deletar encomenda.' });
  }
};
