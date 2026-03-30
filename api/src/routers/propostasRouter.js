import { Router } from 'express';
import * as propostasController from '../controllers/propostasController.js';

const router = Router();

router.get('/minhas', propostasController.minhasPropostas);
router.patch('/:id/aceitar', propostasController.aceitar);
router.delete('/:id', propostasController.cancelar);

export default router;