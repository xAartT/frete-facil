import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);