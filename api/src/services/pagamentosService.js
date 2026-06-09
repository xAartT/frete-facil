import { pool } from '../configs/index.js';

export const criar = async ({
  encomenda_id,
  valor_total,
  taxa_plataforma,
}) => {
  const valor_motorista = valor_total - taxa_plataforma;

  const { rows } = await pool.query(
    `INSERT INTO pagamentos (encomenda_id, valor_total, taxa_plataforma, valor_motorista, status)
     VALUES ($1, $2, $3, $4, 'PENDENTE')
     RETURNING *`,
    [encomenda_id, valor_total, taxa_plataforma, valor_motorista]
  );
  return rows[0];
};

export const buscarPorEncomenda = async (encomenda_id) => {
  const { rows } = await pool.query(
    `SELECT p.*, e.cliente_id, e.motorista_id, e.descricao
     FROM pagamentos p
     JOIN encomendas e ON p.encomenda_id = e.id
     WHERE p.encomenda_id = $1`,
    [encomenda_id]
  );
  return rows[0] || null;
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(
    `SELECT p.*, e.cliente_id, e.motorista_id
     FROM pagamentos p
     JOIN encomendas e ON p.encomenda_id = e.id
     WHERE p.id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const listar = async () => {
  const { rows } = await pool.query(
    `SELECT p.*, e.cliente_id, e.motorista_id, e.descricao, 
            c.nome as cliente_nome, m.nome as motorista_nome
     FROM pagamentos p
     LEFT JOIN encomendas e ON p.encomenda_id = e.id
     LEFT JOIN usuarios c ON e.cliente_id = c.id
     LEFT JOIN usuarios m ON e.motorista_id = m.id
     ORDER BY p.id DESC`
  );
  return rows;
};

export const confirmar = async (pagamento_id, usuario_id) => {
  const pagamento = await buscarPorId(pagamento_id);
  if (!pagamento) return null;

  // Apenas cliente ou motorista podem confirmar
  if (pagamento.cliente_id !== usuario_id && pagamento.motorista_id !== usuario_id) {
    throw { status: 403, mensagem: 'Sem permissão para confirmar este pagamento.' };
  }

  // Apenas pagamentos pendentes podem ser confirmados
  if (pagamento.status !== 'PENDENTE') {
    throw { status: 400, mensagem: 'Apenas pagamentos pendentes podem ser confirmados.' };
  }

  const { rows } = await pool.query(
    'UPDATE pagamentos SET status = $1, data_pagamento = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    ['PAGO', pagamento_id]
  );

  return rows[0];
};

export const estornar = async (pagamento_id, usuario_id) => {
  const pagamento = await buscarPorId(pagamento_id);
  if (!pagamento) return null;

  // Apenas cliente pode estornar
  if (pagamento.cliente_id !== usuario_id) {
    throw { status: 403, mensagem: 'Apenas o cliente pode estornar o pagamento.' };
  }

  // Apenas pagamentos pagos podem ser estornados
  if (pagamento.status !== 'PAGO') {
    throw { status: 400, mensagem: 'Apenas pagamentos confirmados podem ser estornados.' };
  }

  const { rows } = await pool.query(
    'UPDATE pagamentos SET status = $1 WHERE id = $2 RETURNING *',
    ['ESTORNADO', pagamento_id]
  );

  return rows[0];
};
