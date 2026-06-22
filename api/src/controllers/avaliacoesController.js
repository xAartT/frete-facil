import * as avaliacoesService from '../services/avaliacoesService.js';

export const criar = async (req, res) => {
  try {
    const { encomenda_id } = req.params;
    const { avaliado_id, nota, comentario } = req.body;

    if (!avaliado_id || !nota) {
      return res.status(400).json({ erro: 'Usuário avaliado e nota são obrigatórios.' });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({ erro: 'Nota deve estar entre 1 e 5.' });
    }

    const avaliacao = await avaliacoesService.criar({
      encomenda_id: parseInt(encomenda_id),
      avaliador_id: req.usuario.id,
      avaliado_id: parseInt(avaliado_id),
      nota: parseInt(nota),
      comentario: comentario || null,
    });

    return res.status(201).json(avaliacao);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(404).json({ erro: 'Encomenda ou usuário não encontrado.' });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao criar avaliação.' });
  }
};

export const listarPorEncomenda = async (req, res) => {
  try {
    const avaliacoes = await avaliacoesService.listarPorEncomenda(parseInt(req.params.encomenda_id));
    return res.json(avaliacoes);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar avaliações da encomenda.' });
  }
};

export const listarDoUsuario = async (req, res) => {
  try {
    const avaliacoes = await avaliacoesService.listarDoUsuario(parseInt(req.params.usuario_id));
    return res.json(avaliacoes);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao listar avaliações.' });
  }
};

export const mediaDaNotas = async (req, res) => {
  try {
    const media = await avaliacoesService.mediaDaNotas(parseInt(req.params.usuario_id));

    if (!media) {
      return res.status(404).json({ erro: 'Nenhuma avaliação encontrada para este usuário.' });
    }

    return res.json(media);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao calcular média de notas.' });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const avaliacao = await avaliacoesService.buscarPorId(parseInt(req.params.id));

    if (!avaliacao) {
      return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    }

    return res.json(avaliacao);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao buscar avaliação.' });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { nota, comentario } = req.body;

    if (nota && (nota < 1 || nota > 5)) {
      return res.status(400).json({ erro: 'Nota deve estar entre 1 e 5.' });
    }

    const avaliacao = await avaliacoesService.atualizar(
      parseInt(req.params.id),
      req.usuario.id,
      { nota, comentario }
    );

    if (!avaliacao) {
      return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    }

    return res.json(avaliacao);
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ erro: err.mensagem });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao atualizar avaliação.' });
  }
};

export const deletar = async (req, res) => {
  try {
    const resultado = await avaliacoesService.deletar(parseInt(req.params.id), req.usuario.id);

    if (!resultado) {
      return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    }

    return res.status(204).send();
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ erro: err.mensagem });
    }
    return res.status(500).json({ erro: err.mensagem || 'Erro ao deletar avaliação.' });
  }
};
