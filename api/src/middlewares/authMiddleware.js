import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const token = req.cookies?.refresh_token;

  if (!token) {
    return res.status(401).json({ erro: 'Não autenticado. Faça login para continuar.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.usuario = { id: payload.id, login: payload.login, tipo: payload.tipo };
    next();
  } catch (err) {
    const mensagem = err.name === 'TokenExpiredError'
      ? 'Sessão expirada. Faça login novamente.'
      : 'Token inválido.';
    return res.status(401).json({ erro: mensagem });
  }
}

export function autorizar(...tipos) {
  return (req, res, next) => {
    if (!tipos.includes(req.usuario?.tipo)) {
      return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
}