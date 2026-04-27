import { Router } from 'express';
import authRouter from './authRouter.js';
import usuariosRouter from './usuariosRouter.js';
import veiculosRouter from './veiculosRouter.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/usuarios', usuariosRouter);

router.use('/veiculos',   veiculosRouter);
// router.use('/encomendas', encomendasRouter);
// router.use('/propostas',  propostasRouter);
// router.use('/pagamentos', pagamentosRouter);
// router.use('/avaliacoes', avaliacoesRouter);

export default router;