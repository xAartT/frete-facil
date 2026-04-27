import * as veiculosService from '../services/veiculosService.js';

export const criar = async (req, res) => {
  try {
    const veiculo = await veiculosService.criar(req.body);
    return res.status(201).json(veiculo);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Placa já cadastrada.' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.status(500).json({ erro: 'Erro interno ao criar veículo.' });
  }
};

export const listar = async (_req, res) => {
  try {
    const veiculos = await veiculosService.listar();
    return res.json(veiculos);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno ao listar veículos.' });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const veiculo = await veiculosService.buscarPorId(req.params.id);
    if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado.' });
    return res.json(veiculo);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno ao buscar veículo.', erro: err.message});
  }
};

export const atualizar = async (req, res) => {
  try {
    const veiculo = await veiculosService.atualizar(req.params.id, req.body);
    if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado ou nenhum campo válido enviado.' });
    return res.json(veiculo);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Placa já cadastrada.' });
    }
    return res.status(500).json({ erro: 'Erro interno ao atualizar veículo.' });
  }
};

export const deletar = async (req, res) => {
  try {
    const veiculo = await veiculosService.deletar(req.params.id);
    if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado.' });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ erro: 'Erro interno ao deletar veículo.' });
  }
};
