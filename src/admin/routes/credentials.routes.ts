import { Router } from 'express';
import { credentialsController } from '../controllers/credentials.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, credentialsController.listCredentials);

export default router;
