import { pool } from '../configs/index.js';

export const criar = async ({ usuario_id, nome, modelo, cor, placa, marca, ano, renavam, peso_max }) => {
  const { rows } = await pool.query(
    `INSERT INTO veiculos (usuario_id, nome, modelo, cor, placa, marca, ano, renavam, peso_max)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [usuario_id, nome, modelo, cor, placa, marca, ano, renavam, peso_max]
  );
  return rows[0];
};

export const listar = async () => {
    const { rows } = await pool.query(`SELECT nome, modelo, cor, placa, marca, ano, renavam, peso_max FROM veiculos ORDER BY criado_em DESC `);
    return rows;
};

export const buscarPorId = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM veiculos WHERE id = $1`, [id]);
  return rows[0] || null;
};

export const atualizar = async (id, campos) => {
  const permitidos = ['nome', 'modelo', 'cor', 'placa', 'marca', 'ano', 'renavam', 'peso_max'];
  const entradas = Object.entries(campos).filter(([k]) => permitidos.includes(k));
  
  if (entradas.length === 0) return null;

  const sets = entradas.map(([k], i) => `${k} = $${i + 1}`).join(', ');
  const valores = entradas.map(([, v]) => v);

  const { rows } = await pool.query(
    `UPDATE veiculos SET ${sets} WHERE id = $${valores.length + 1} RETURNING *`,
    [...valores, id]
  );
  return rows[0] || null;
};

export const deletar = async (id) => {
  const { rows } = await pool.query(`DELETE FROM veiculos WHERE id = $1 RETURNING *`, [id]);
  return rows[0] || null;
};
