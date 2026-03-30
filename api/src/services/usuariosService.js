import { pool } from '../configs/index.js';

export const meuPerfil = async (userId) => {
    const avaliacoes = await pool.query("select * from avaliacoes where avaliado_id = $1", [userId]);
    const encomendas = await pool.query
}