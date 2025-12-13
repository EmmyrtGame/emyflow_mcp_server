import { Request, Response } from 'express';
import { analyticsService, EventType } from '../../services/analytics.service';

class AnalyticsController {
  /**
   * GET /api/admin/clients/:id/analytics
   * Returns aggregated stats and recent events for a client.
   */
  async getClientAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [stats, recentEvents] = await Promise.all([
        analyticsService.getClientStats(id),
        analyticsService.getClientEvents(id, { limit: 10 }),
      ]);

      res.json({
        stats,
        recentEvents: recentEvents.data,
      });
    } catch (error) {
      console.error('Get Analytics error:', error);
      res.status(500).json({ message: 'Error fetching analytics' });
    }
  }

  /**
   * GET /api/admin/clients/:id/events
   * Returns paginated events for a client with optional filters.
   */
  async getClientEvents(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const eventType = req.query.eventType as EventType | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const result = await analyticsService.getClientEvents(id, {
        page,
        limit,
        eventType,
        startDate,
        endDate,
      });

      res.json(result);
    } catch (error) {
      console.error('Get Events error:', error);
      res.status(500).json({ message: 'Error fetching events' });
    }
  }
}

export const analyticsController = new AnalyticsController();
