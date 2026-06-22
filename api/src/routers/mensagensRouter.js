import { Router } from 'express';
import * as mensagensController from '../controllers/mensagensController.js';

const router = Router();

router.get('/conversas', mensagensController.listarConversas);
router.get('/conversa/:outroId', mensagensController.listarConversa);
router.post('/', mensagensController.enviar);

export default router;
