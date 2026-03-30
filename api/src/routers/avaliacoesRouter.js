import { Router } from 'express';
import * as avaliacoesController from '../controllers/avaliacoesController.js';

const router = Router();

router.post('/encomenda/:encomenda_id', avaliacoesController.criar);
router.get('/usuario/:usuario_id', avaliacoesController.listarDoUsuario);
router.get('/usuario/:usuario_id/media', avaliacoesController.mediaDaNotas);

export default router;