import { Router } from 'express';
import * as avaliacoesController from '../controllers/avaliacoesController.js';

const router = Router();

router.post('/encomenda/:encomenda_id', avaliacoesController.criar);
router.get('/encomenda/:encomenda_id', avaliacoesController.listarPorEncomenda);
router.get('/usuario/:usuario_id', avaliacoesController.listarDoUsuario);
router.get('/usuario/:usuario_id/media', avaliacoesController.mediaDaNotas);
router.get('/:id', avaliacoesController.buscarPorId);
router.patch('/:id', avaliacoesController.atualizar);
router.delete('/:id', avaliacoesController.deletar);

export default router;