import { pool } from '../configs/index.js';

export const enviar = async ({ remetente_id, destinatario_id, texto, encomenda_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO mensagens (remetente_id, destinatario_id, texto, encomenda_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [remetente_id, destinatario_id, texto, encomenda_id || null]
  );
  return rows[0];
};

export const listarConversa = async (usuario_id, outro_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM mensagens
     WHERE (remetente_id = $1 AND destinatario_id = $2)
        OR (remetente_id = $2 AND destinatario_id = $1)
     ORDER BY criado_em ASC`,
    [usuario_id, outro_id]
  );
  return rows;
};

export const marcarComoLidas = async (usuario_id, outro_id) => {
  await pool.query(
    `UPDATE mensagens SET lida = TRUE
     WHERE destinatario_id = $1 AND remetente_id = $2 AND lida = FALSE`,
    [usuario_id, outro_id]
  );
};

// Lista as conversas do usuário: um item por interlocutor, com a última mensagem
// e a contagem de não lidas, ordenadas da mais recente para a mais antiga.
export const listarConversas = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT
       sub.outro_id,
       u.nome AS outro_nome,
       sub.ultima_mensagem,
       sub.criado_em,
       (SELECT COUNT(*) FROM mensagens mm
          WHERE mm.destinatario_id = $1
            AND mm.remetente_id = sub.outro_id
            AND mm.lida = FALSE)::int AS nao_lidas
     FROM (
       SELECT DISTINCT ON (outro_id)
         outro_id, texto AS ultima_mensagem, criado_em
       FROM (
         SELECT texto, criado_em,
           CASE WHEN remetente_id = $1 THEN destinatario_id ELSE remetente_id END AS outro_id
         FROM mensagens
         WHERE remetente_id = $1 OR destinatario_id = $1
       ) base
       ORDER BY outro_id, criado_em DESC
     ) sub
     JOIN usuarios u ON u.id = sub.outro_id
     ORDER BY sub.criado_em DESC`,
    [usuario_id]
  );
  return rows;
};
