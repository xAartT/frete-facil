import { Router } from 'express';
import * as enderecosController from '../controllers/enderecosController.js';

const router = Router();

router.get('/', enderecosController.listarDoUsuario);
router.post('/', enderecosController.criar);
router.get('/:id', enderecosController.buscarPorId);
router.patch('/:id', enderecosController.atualizar);
router.delete('/:id', enderecosController.deletar);

export default router;