import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

// GET /api/admin/clients/:id/analytics - Get stats and recent events
router.get('/:id/analytics', analyticsController.getClientAnalytics);

// GET /api/admin/clients/:id/events - Get paginated events with filters
router.get('/:id/events', analyticsController.getClientEvents);

export default router;
