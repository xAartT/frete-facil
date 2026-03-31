import { Router } from 'express';
import { autenticar, autorizar } from '../middlewares/authMiddleware.js';
import * as usuariosController from '../controllers/usuariosController.js';

const router = Router();

router.use(autenticar);
router.get('/me', usuariosController.meuPerfil);
router.patch('/me/senha', usuariosController.alterarSenha);
router.get('/', autorizar('ADMIN'), usuariosController.listar);
router.get('/:id', usuariosController.buscarPorId);
router.patch('/:id', usuariosController.atualizar);
router.delete('/:id', autorizar('ADMIN'), usuariosController.deletar);

export default router;