import { pool } from '../configs/index.js';

export const criar = async ({
  encomenda_id,
  motorista_id,
  valor_proposto,
  mensagem,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO propostas (encomenda_id, motorista_id, valor_proposto, mensagem, status)
     VALUES ($1, $2, $3, $4, 'PENDENTE')
     RETURNING *`,
    [encomenda_id, motorista_id, valor_proposto, mensagem || null]
  );
  return rows[0];
};

export const listarPorEncomenda = async (encomenda_id) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.nome as motorista_nome, u.login as motorista_login, u.email as motorista_email
     FROM propostas p
     JOIN usuarios u ON p.motorista_id = u.id
     WHERE p.encomenda_id = $1
     ORDER BY p.data_proposta DESC`,
    [encomenda_id]
  );
  return rows;
};

export const minhasPropostas = async (motorista_id) => {
  const { rows } = await pool.query(
    `SELECT p.*, 
            e.descricao, e.peso, e.valor_sugerido, e.status as encomenda_status,
            c.nome as cliente_nome, c.login as cliente_login
     FROM propostas p
     JOIN encomendas e ON p.encomenda_id = e.id
     JOIN usuarios c ON e.cliente_id = c.id
     WHERE p.motorista_id = $1
     ORDER BY p.data_proposta DESC`,
    [motorista_id]
  );
  return rows;
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.nome as motorista_nome, u.login as motorista_login
     FROM propostas p
     JOIN usuarios u ON p.motorista_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const aceitar = async (proposta_id, usuario_id) => {
  // Buscar proposta
  const proposta = await buscarPorId(proposta_id);
  if (!proposta) return null;

  // Verificar se a proposta está pendente
  if (proposta.status !== 'PENDENTE') {
    throw { status: 400, mensagem: 'Apenas propostas pendentes podem ser aceitas.' };
  }

  // Buscar encomenda para verificar permissão
  const { rows: encomendas } = await pool.query(
    'SELECT cliente_id, status FROM encomendas WHERE id = $1',
    [proposta.encomenda_id]
  );

  const encomenda = encomendas[0];
  if (!encomenda) {
    throw { status: 404, mensagem: 'Encomenda não encontrada.' };
  }

  // Verificar permissão: apenas cliente pode aceitar proposta
  if (encomenda.cliente_id !== usuario_id) {
    throw { status: 403, mensagem: 'Apenas o cliente pode aceitar a proposta.' };
  }

  // Usar transação
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Atualizar status da proposta
    await client.query(
      'UPDATE propostas SET status = $1 WHERE id = $2',
      ['ACEITA', proposta_id]
    );

    // Rejeitar todas as outras propostas
    await client.query(
      `UPDATE propostas SET status = $1 
       WHERE encomenda_id = $2 AND id != $3 AND status = $4`,
      ['RECUSADA', proposta.encomenda_id, proposta_id, 'PENDENTE']
    );

    // Atualizar encomenda com motorista e status
    const resultado = await client.query(
      `UPDATE encomendas 
       SET motorista_id = $1, status = $2
       WHERE id = $3
       RETURNING *`,
      [proposta.motorista_id, 'ACEITA', proposta.encomenda_id]
    );

    // Criar pagamento
    const taxa = resultado.rows[0].valor_sugerido * 0.1; // 10% de taxa
    await client.query(
      `INSERT INTO pagamentos (encomenda_id, valor_total, taxa_plataforma, valor_motorista, status)
       VALUES ($1, $2, $3, $4, 'PENDENTE')`,
      [proposta.encomenda_id, resultado.rows[0].valor_sugerido, taxa, resultado.rows[0].valor_sugerido - taxa]
    );

    await client.query('COMMIT');

    return resultado.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const cancelar = async (proposta_id, usuario_id) => {
  const proposta = await buscarPorId(proposta_id);
  if (!proposta) return null;

  // Verificar permissão: motorista pode cancelar sua proposta
  if (proposta.motorista_id !== usuario_id) {
    throw { status: 403, mensagem: 'Você só pode cancelar suas próprias propostas.' };
  }

  // Apenas propostas pendentes podem ser canceladas
  if (proposta.status !== 'PENDENTE') {
    throw { status: 400, mensagem: 'Apenas propostas pendentes podem ser canceladas.' };
  }

  const { rows } = await pool.query(
    'UPDATE propostas SET status = $1 WHERE id = $2 RETURNING *',
    ['RECUSADA', proposta_id]
  );

  return rows[0];
};
