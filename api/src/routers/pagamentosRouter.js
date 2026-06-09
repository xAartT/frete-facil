import { Router } from 'express';
import * as pagamentosController from '../controllers/pagamentosController.js';
import { autorizar } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', autorizar('ADMIN'), pagamentosController.listar);
router.post('/encomenda/:encomenda_id', pagamentosController.criar);
router.get('/encomenda/:encomenda_id', pagamentosController.buscarPorEncomenda);
router.patch('/:id/confirmar', pagamentosController.confirmar);
router.patch('/:id/estornar', pagamentosController.estornar);

export default router;