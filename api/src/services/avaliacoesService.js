import { pool } from '../configs/index.js';

export const criar = async ({
  encomenda_id,
  avaliador_id,
  avaliado_id,
  nota,
  comentario,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO avaliacoes (encomenda_id, avaliador_id, avaliado_id, nota, comentario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [encomenda_id, avaliador_id, avaliado_id, nota, comentario]
  );
  return rows[0];
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT a.*, 
            av.nome as avaliador_nome, av.login as avaliador_login,
            u.nome as avaliado_nome, u.login as avaliado_login
     FROM avaliacoes a
     JOIN usuarios av ON a.avaliador_id = av.id
     JOIN usuarios u ON a.avaliado_id = u.id
     WHERE a.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const listarPorEncomenda = async (encomenda_id) => {
  const { rows } = await pool.query(
    `SELECT a.*,
            av.nome as avaliador_nome,
            u.nome as avaliado_nome
     FROM avaliacoes a
     JOIN usuarios av ON a.avaliador_id = av.id
     JOIN usuarios u ON a.avaliado_id = u.id
     WHERE a.encomenda_id = $1
     ORDER BY a.data_avaliacao DESC`,
    [encomenda_id]
  );
  return rows;
};

export const listarDoUsuario = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT a.*, 
            av.nome as avaliador_nome, av.login as avaliador_login,
            e.descricao as encomenda_descricao
     FROM avaliacoes a
     JOIN usuarios av ON a.avaliador_id = av.id
     LEFT JOIN encomendas e ON a.encomenda_id = e.id
     WHERE a.avaliado_id = $1
     ORDER BY a.data_avaliacao DESC`,
    [usuario_id]
  );
  return rows;
};

export const mediaDaNotas = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT 
      COUNT(*) as total_avaliacoes,
      ROUND(AVG(nota)::numeric, 2) as media_nota,
      MIN(nota) as nota_minima,
      MAX(nota) as nota_maxima
     FROM avaliacoes
     WHERE avaliado_id = $1`,
    [usuario_id]
  );

  if (rows[0].total_avaliacoes === 0) {
    return null;
  }

  return rows[0];
};

export const atualizar = async (id, usuario_id, { nota, comentario }) => {
  const avaliacao = await buscarPorId(id);
  if (!avaliacao) return null;

  // Apenas o avaliador pode editar sua avaliação
  if (avaliacao.avaliador_id !== usuario_id) {
    throw { status: 403, mensagem: 'Você só pode editar suas próprias avaliações.' };
  }

  const campos = [];
  const valores = [];

  if (nota !== undefined) {
    campos.push(`nota = $${valores.length + 1}`);
    valores.push(nota);
  }

  if (comentario !== undefined) {
    campos.push(`comentario = $${valores.length + 1}`);
    valores.push(comentario);
  }

  if (campos.length === 0) {
    return avaliacao;
  }

  valores.push(id);

  const { rows } = await pool.query(
    `UPDATE avaliacoes
     SET ${campos.join(', ')}
     WHERE id = $${valores.length}
     RETURNING *`,
    valores
  );

  return rows[0];
};

export const deletar = async (id, usuario_id) => {
  const avaliacao = await buscarPorId(id);
  if (!avaliacao) return null;

  // Apenas o avaliador pode deletar sua avaliação
  if (avaliacao.avaliador_id !== usuario_id) {
    throw { status: 403, mensagem: 'Você só pode deletar suas próprias avaliações.' };
  }

  const { rows } = await pool.query(
    'DELETE FROM avaliacoes WHERE id = $1 RETURNING *',
    [id]
  );

  return rows[0];
};
