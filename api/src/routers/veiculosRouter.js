import { Router } from 'express';
import * as veiculosController from '../controllers/veiculosController.js';

const router = Router();

router.post('/', veiculosController.criar);
router.get('/', veiculosController.listar);
router.get('/:id', veiculosController.buscarPorId);
router.patch('/:id', veiculosController.atualizar);
router.delete('/:id', veiculosController.deletar);

export default router;