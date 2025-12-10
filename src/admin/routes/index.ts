import { Router } from 'express';
import authRoutes from './auth.routes';
import clientsRoutes from './clients.routes';
import credentialsRoutes from './credentials.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientsRoutes);
router.use('/credentials', credentialsRoutes);

export default router;
