import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../configs/index.js';

const SALT_ROUNDS    = 10;
const ACCESS_EXPIRY  = '15m';
const REFRESH_EXPIRY = '7d';

function gerarTokens(payload) {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
  return { accessToken, refreshToken };
}

export async function registrar(body) {
  const { rows } = await pool.query(
    'SELECT id FROM usuarios WHERE login = $1 OR email = $2',
    [body.login, body.email]
  );
  if (rows.length > 0) {
    throw { status: 409, mensagem: 'Login ou e-mail já cadastrado.' };
  }

  const senha_hash = await bcrypt.hash(body.senha, SALT_ROUNDS);

  const resultado = await pool.query(
    `INSERT INTO usuarios (nome, login, senha_hash, tipo, email, data_nascimento)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, login, tipo, email, criado_em`,
    [body.nome, body.login, senha_hash, body.tipo, body.email, body.dataNascimento || null]
  );

  return resultado.rows[0];
}

export async function login({ login, senha }) {
  const { rows } = await pool.query(
    'SELECT id, nome, login, senha_hash, tipo, email FROM usuarios WHERE login = $1',
    [login]
  );

  const usuario = rows[0];

  if (!usuario) {
    throw { status: 401, mensagem: 'Credenciais inválidas.' };
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaCorreta) {
    throw { status: 401, mensagem: 'Credenciais inválidas.' };
  }

  const payload = { id: usuario.id, login: usuario.login, tipo: usuario.tipo };
  const { accessToken, refreshToken } = gerarTokens(payload);

  await pool.query('DELETE FROM tokens WHERE usuario_id = $1', [usuario.id]);
  await pool.query(
    'INSERT INTO tokens (usuario_id, refresh_token, access_token) VALUES ($1, $2, $3)',
    [usuario.id, refreshToken, accessToken]
  );

  return {
    usuario: { id: usuario.id, nome: usuario.nome, login: usuario.login, tipo: usuario.tipo, email: usuario.email },
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshToken) {
  if (!refreshToken) {
    throw { status: 401, mensagem: 'Refresh token não fornecido.' };
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    const mensagem = err.name === 'TokenExpiredError'
      ? 'Refresh token expirado. Faça login novamente.'
      : 'Refresh token inválido.';
    throw { status: 401, mensagem };
  }

  const { rows } = await pool.query(
    'SELECT id FROM tokens WHERE refresh_token = $1 AND usuario_id = $2',
    [refreshToken, payload.id]
  );
  if (rows.length === 0) {
    throw { status: 401, mensagem: 'Sessão inválida. Faça login novamente.' };
  }

  const novoPayload = { id: payload.id, login: payload.login, tipo: payload.tipo };
  const novosTokens = gerarTokens(novoPayload);

  await pool.query(
    'UPDATE tokens SET refresh_token = $1, criado_em = CURRENT_TIMESTAMP WHERE usuario_id = $2',
    [novosTokens.refreshToken, payload.id]
  );

  return novosTokens;
}

export async function logout(usuarioId) {
  await pool.query('DELETE FROM tokens WHERE usuario_id = $1', [usuarioId]);
}