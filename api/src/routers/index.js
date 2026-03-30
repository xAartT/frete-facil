import { Router } from 'express';
import authRoter from './authRouter.js';
import usuariosRouter from './usuariosRouter.js';
import veiculosRouter from './veiculosRouter.js';
import encomendasRouter from './encomendasRouter.js';
import propostasRouter from './propostasRouter.js';
import pagamentosRouter from './pagamentosRouter.js';
import avaliacoesRouter from './avaliacoesRouter.js';

import * as authMiddleware from '../middlewares/AuthMiddleware.js';

const autenticar = authMiddleware.autenticar;
const router = Router();

router.use('/auth', authRoter);
router.use('/usuarios', autenticar, usuariosRouter);
router.use('/veiculos', autenticar, veiculosRouter);
router.use('/encomendas', autenticar, encomendasRouter);
router.use('/propostas', autenticar, propostasRouter);
router.use('/pagamentos', autenticar, pagamentosRouter);
router.use('/avaliacoes', autenticar, avaliacoesRouter);

export default router;