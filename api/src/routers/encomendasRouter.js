import { Router } from 'express';
import * as encomendasController from '../controllers/encomendasController.js';
import * as propostasController from '../controllers/propostasController.js';

const router = Router();

router.get('/disponiveis', encomendasController.listarDisponiveis);
router.get('/minhas', encomendasController.minhasEncomendas);
router.post('/', encomendasController.criar);
router.get('/:id', encomendasController.buscarPorId);
router.patch('/:id/status', encomendasController.atualizarStatus);
router.delete('/:id', encomendasController.deletar);
router.get('/:encomenda_id/propostas', propostasController.listarPorEncomenda);
router.post('/:encomenda_id/propostas', propostasController.criar);

export default router;