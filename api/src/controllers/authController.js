import * as authService from '../services/authService.js';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, COOKIE_OPTS);
}

function clearRefreshCookie(res) {
  res.clearCookie('refresh_token', { ...COOKIE_OPTS, maxAge: 0 });
}

export async function registrar(req, res) {
  try {
    const usuario = await authService.registrar(req.body);
    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', usuario });
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function login(req, res) {
  try {
    const { usuario, access_token, refresh_token } = await authService.login(req.body);

    setRefreshCookie(res, refresh_token);

    return res.status(200).json({ usuario, access_token });
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function refresh(req, res) {
  try {
    const refresh_token = req.cookies?.refresh_token;

    if (!refresh_token) {
      return res.status(401).json({ erro: 'Refresh token não fornecido.' });
    }

    const tokens = await authService.refreshToken(refresh_token);

    setRefreshCookie(res, tokens.refresh_token);

    return res.status(200).json({ access_token: tokens.access_token });
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function logout(req, res) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }

    await authService.logout(req.usuario.id);

    clearRefreshCookie(res);

    return res.status(200).json({ mensagem: 'Logout realizado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}