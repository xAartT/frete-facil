import { Router } from 'express';
import * as controller from '../controllers/usuariosController.js';

const router = Router();

router.get('/me', controller.meuPerfil);
router.patch('/me/senha', controller.alterarSenha);
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.patch('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;