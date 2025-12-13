import { Router } from 'express';
import authRoutes from './auth.routes';
import clientsRoutes from './clients.routes';
import credentialsRoutes from './credentials.routes';
import usersRoutes from './users.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientsRoutes);
router.use('/clients', analyticsRoutes); // Analytics routes under /clients/:id/analytics
router.use('/credentials', credentialsRoutes);
router.use('/users', usersRoutes);

export default router;
