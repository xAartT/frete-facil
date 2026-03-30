import * as authService from '../services/authService.js';
import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ erro: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = payload;

    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido.' });
  }
}