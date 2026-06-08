import { Router } from 'express';
import * as enderecosController from '../controllers/enderecosController.js';

const router = Router();

router.get('/get', enderecosController.listarDoUsuario);
router.post('/enderecos', enderecosController.criar);
router.delete('/enderecos/:id', enderecosController.deletar);
router.patch('/enderecos/:id', enderecosController.atualizar);
router.get('/enderecos/:id', enderecosController.buscarPorId);

export default router;