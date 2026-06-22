import { Router } from 'express';
import authRouter from './authRouter.js';
import usuariosRouter from './usuariosRouter.js';
import veiculosRouter from './veiculosRouter.js';
import enderecosRouter from './enderecosRouter.js';
import encomendasRouter from './encomendasRouter.js';
import propostasRouter from './propostasRouter.js';
import pagamentosRouter from './pagamentosRouter.js';
import avaliacoesRouter from './avaliacoesRouter.js';
import mensagensRouter from './mensagensRouter.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/usuarios', usuariosRouter);
router.use('/veiculos', autenticar, veiculosRouter);
router.use('/enderecos', autenticar, enderecosRouter);
router.use('/encomendas', autenticar, encomendasRouter);
router.use('/propostas', autenticar, propostasRouter);
router.use('/pagamentos', autenticar, pagamentosRouter);
router.use('/avaliacoes', autenticar, avaliacoesRouter);
router.use('/mensagens', autenticar, mensagensRouter);

export default router;