import * as mensagensService from '../services/mensagensService.js';

export const listarConversas = async (req, res) => {
  try {
    const conversas = await mensagensService.listarConversas(req.usuario.id);
    return res.json(conversas);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar conversas.' });
  }
};

export const listarConversa = async (req, res) => {
  try {
    const outroId = parseInt(req.params.outroId);
    if (Number.isNaN(outroId)) {
      return res.status(400).json({ erro: 'Identificador de conversa inválido.' });
    }

    const mensagens = await mensagensService.listarConversa(req.usuario.id, outroId);
    await mensagensService.marcarComoLidas(req.usuario.id, outroId);

    return res.json(mensagens);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao carregar mensagens.' });
  }
};

export const enviar = async (req, res) => {
  try {
    const { destinatario_id, texto, encomenda_id } = req.body;

    if (!destinatario_id || !texto || !texto.trim()) {
      return res.status(400).json({ erro: 'Destinatário e texto são obrigatórios.' });
    }
    if (destinatario_id === req.usuario.id) {
      return res.status(400).json({ erro: 'Não é possível enviar mensagem para si mesmo.' });
    }

    const mensagem = await mensagensService.enviar({
      remetente_id: req.usuario.id,
      destinatario_id,
      texto: texto.trim(),
      encomenda_id,
    });

    return res.status(201).json(mensagem);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(404).json({ erro: 'Usuário ou encomenda não encontrado.' });
    }
    return res.status(500).json({ erro: 'Erro ao enviar mensagem.' });
  }
};
