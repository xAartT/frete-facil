import * as authService from '../services/authService.js';

const COOKIE_NOME = 'refresh_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function registrar(req, res) {
  try {
    if (!req.body.nome || !req.body.email || !req.body.senha || !req.body.login || !req.body.dataNascimento || !req.body.tipo) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    const usuario = await authService.registrar(req.body);

    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', usuario });
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function login(req, res) {
  try {
    const { usuario, accessToken, refreshToken } = await authService.login(req.body);

    res.cookie(COOKIE_NOME, refreshToken, COOKIE_OPTS);

    return res.status(200).json({ usuario, accessToken });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function refresh(req, res) {
  try {
    const tokenAtual = req.cookies?.[COOKIE_NOME];

    const { accessToken, refreshToken } = await authService.refresh(tokenAtual);

    res.cookie(COOKIE_NOME, refreshToken, COOKIE_OPTS);

    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(err.status || 500).json({ erro: err.mensagem || 'Erro interno.' });
  }
}

export async function logout(req, res) {
  try {
    await authService.logout(req.usuario.id);

    console.log(req.usuario.id);

    res.clearCookie(COOKIE_NOME, { ...COOKIE_OPTS, maxAge: 0 });

    return res.status(200).json({ mensagem: 'Logout realizado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}