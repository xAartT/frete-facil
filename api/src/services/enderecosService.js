import { pool } from '../configs/index.js';

export const listarDoUsuario = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM enderecos WHERE usuario_id = $1 ORDER BY id ASC`,
    [usuario_id]
  );
  return rows;
};

export const buscarPorId = async (id, usuario_id) => {
  const { rows: [endereco] } = await pool.query(
    `SELECT * FROM enderecos WHERE id = $1`,
    [id]
  );
  if (!endereco) return { erro: 'nao_encontrado' };
  if (endereco.usuario_id !== usuario_id) return { erro: 'sem_permissao' };
  return endereco;
};

export const criar = async ({ usuario_id, cep, numero, logradouro, bairro, complemento, estado, pais, cidade, latitude, longitude }) => {
  const { rows: [endereco] } = await pool.query(
    `INSERT INTO enderecos (usuario_id, cep, numero, logradouro, bairro, complemento, estado, pais, cidade, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [usuario_id, cep, numero, logradouro, bairro, complemento, estado, pais, cidade, latitude, longitude]
  );
  return endereco;
};

export const atualizar = async (id, usuario_id, campos) => {
  const existente = await buscarPorId(id, usuario_id);
  if (existente?.erro) return existente;

  const permitidos = ['cep', 'numero', 'logradouro', 'bairro', 'complemento', 'estado', 'pais', 'cidade', 'latitude', 'longitude'];
  const entradas = Object.entries(campos).filter(([k]) => permitidos.includes(k));
  if (entradas.length === 0) return { erro: 'sem_campos' };

  const sets = entradas.map(([k], i) => `${k} = $${i + 1}`).join(', ');
  const valores = entradas.map(([, v]) => v);

  const { rows: [endereco] } = await pool.query(
    `UPDATE enderecos SET ${sets} WHERE id = $${valores.length + 1} RETURNING *`,
    [...valores, id]
  );
  return endereco;
};

export const deletar = async (id, usuario_id) => {
  const existente = await buscarPorId(id, usuario_id);
  if (existente?.erro) return existente;

  const { rows: [endereco] } = await pool.query(
    `DELETE FROM enderecos WHERE id = $1 RETURNING *`,
    [id]
  );
  return endereco;
};