import pool from '../configs/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function registrar(dados) {
  const { nome, login, email, senha, tipo, data_nascimento } = dados;

  const senha_hash = await bcrypt.hash(senha, 10);

  try {
    const sql = `
      INSERT INTO usuarios (nome, login, email, senha_hash, tipo, data_nascimento)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome, email, login, tipo
    `;

    const values = [nome, login, email, senha_hash, tipo, data_nascimento];

    const result = await pool.query(sql, values);

    return result.rows[0];
  } catch (err) {
    throw { status: 500, mensagem: 'Erro ao registrar usuário.' };
  }
}

export async function login(dados) {
  const { login, senha } = dados;

  const sql = `
    SELECT id, nome, email, login, senha_hash, tipo
    FROM usuarios
    WHERE login = $1
  `;

  const result = await pool.query(sql, [login]);

  const usuario = result.rows[0];

  if (!usuario) {
    throw { status: 401, mensagem: 'Credenciais inválidas.' };
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaValida) {
    throw { status: 401, mensagem: 'Credenciais inválidas.' };
  }

  const payload = {
    id: usuario.id,
    login: usuario.login,
    tipo: usuario.tipo
  };

  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refresh_token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      tipo: usuario.tipo
    },
    access_token,
    refresh_token
  };
}

export async function refreshToken(token) {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET);

    const novoAccessToken = jwt.sign(
      {
        id: payload.id,
        login: payload.login,
        tipo: payload.tipo
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const novoRefreshToken = jwt.sign(
      {
        id: payload.id,
        login: payload.login,
        tipo: payload.tipo
      },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return {
      access_token: novoAccessToken,
      refresh_token: novoRefreshToken
    };
  } catch {
    throw { status: 401, mensagem: 'Refresh token inválido.' };
  }
}