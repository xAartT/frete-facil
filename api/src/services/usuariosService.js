import bcrypt from 'bcrypt';
import { pool } from '../configs/index.js';

export async function listar() {
  const { rows } = await pool.query(
    `SELECT id, nome, login, tipo, email, data_nascimento, criado_em
     FROM usuarios
     ORDER BY criado_em DESC`
  );
  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT id, nome, login, tipo, email, data_nascimento, criado_em
     FROM usuarios WHERE id = $1`,
    [id]
  );
  if (!rows[0]) throw { status: 404, mensagem: 'Usuário não encontrado.' };
  return rows[0];
}

export async function atualizar(id, { nome, email, data_nascimento }) {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET
       nome = COALESCE($1, nome),
       email = COALESCE($2, email),
       data_nascimento = COALESCE($3, data_nascimento)
     WHERE id = $4
     RETURNING id, nome, login, tipo, email, data_nascimento, criado_em`,
    [nome || null, email || null, data_nascimento || null, id]
  );
  if (!rows[0]) throw { status: 404, mensagem: 'Usuário não encontrado.' };
  return rows[0];
}

export async function alterarSenha(id, { senha_atual, nova_senha }) {
  const { rows } = await pool.query(
    'SELECT senha_hash FROM usuarios WHERE id = $1',
    [id]
  );
  if (!rows[0]) throw { status: 404, mensagem: 'Usuário não encontrado.' };

  const senhaCorreta = await bcrypt.compare(senha_atual, rows[0].senha_hash);
  if (!senhaCorreta) throw { status: 401, mensagem: 'Senha atual incorreta.' };

  const novaSenhaHash = await bcrypt.hash(nova_senha, 10);
  await pool.query('UPDATE usuarios SET senha_hash = $1 WHERE id = $2', [novaSenhaHash, id]);
}

export async function deletar(id) {
  const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  if (rowCount === 0) throw { status: 404, mensagem: 'Usuário não encontrado.' };
}