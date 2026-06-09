import * as pagamentosService from '../services/pagamentosService.js';

export const criar = async (req, res) => {
  try {
    const { encomenda_id } = req.params;
    const { valor_total, taxa_plataforma } = req.body;

    if (!valor_total) {
      return res.status(400).json({ erro: 'Valor total é obrigatório.' });
    }

    const pagamento = await pagamentosService.criar({
      encomenda_id: parseInt(encomenda_id),
      valor_total,
      taxa_plataforma: taxa_plataforma || valor_total * 0.1,
    });

    return res.status(201).json(pagamento);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(404).json({ erro: 'Encomenda não encontrada.' });
    }
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Já existe pagamento para esta encomenda.' });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao criar pagamento.' });
  }
};

export const buscarPorEncomenda = async (req, res) => {
  try {
    const pagamento = await pagamentosService.buscarPorEncomenda(parseInt(req.params.encomenda_id));

    if (!pagamento) {
      return res.status(404).json({ erro: 'Pagamento não encontrado.' });
    }

    return res.json(pagamento);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar pagamento.' });
  }
};

export const listar = async (_req, res) => {
  try {
    const pagamentos = await pagamentosService.listar();
    return res.json(pagamentos);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar pagamentos.' });
  }
};

export const confirmar = async (req, res) => {
  try {
    const pagamento = await pagamentosService.confirmar(parseInt(req.params.id), req.usuario.id);

    if (!pagamento) {
      return res.status(404).json({ erro: 'Pagamento não encontrado.' });
    }

    return res.json({ mensagem: 'Pagamento confirmado com sucesso.', pagamento });
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ erro: err.mensagem });
    }
    if (err.status === 400) {
      return res.status(400).json({ erro: err.mensagem });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao confirmar pagamento.' });
  }
};

export const estornar = async (req, res) => {
  try {
    const pagamento = await pagamentosService.estornar(parseInt(req.params.id), req.usuario.id);

    if (!pagamento) {
      return res.status(404).json({ erro: 'Pagamento não encontrado.' });
    }

    return res.json({ mensagem: 'Pagamento estornado com sucesso.', pagamento });
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ erro: err.mensagem });
    }
    if (err.status === 400) {
      return res.status(400).json({ erro: err.mensagem });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao estornar pagamento.' });
  }
};
