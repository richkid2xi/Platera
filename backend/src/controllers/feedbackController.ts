import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createFeedbackSchema } from '../utils/schemas';
import { OrderStatus, Role } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';

export const submitFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.params.token as string;
    const orderId = req.params.orderId as string;
    const data = createFeedbackSchema.parse(req.body);

    const tableToken = await prisma.tableToken.findUnique({
      where: { token },
      include: { table: true }
    });

    if (!tableToken || !tableToken.isActive) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const { id: tableId, restaurantId } = tableToken.table;

    // Verify order belongs to this table and is SERVED
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        tableId,
        restaurantId
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status !== OrderStatus.SERVED) {
      res.status(400).json({ error: 'Feedback can only be submitted for served orders' });
      return;
    }

    // Check if feedback already exists for this order to prevent duplicates
    const existingFeedback = await prisma.feedback.findFirst({
      where: { orderId }
    });

    if (existingFeedback) {
      res.status(400).json({ error: 'Feedback already submitted for this order' });
      return;
    }

    // Process itemRatings
    const itemRatingsData = data.itemRatings ? data.itemRatings.map(ir => ({
      menuItemId: ir.menuItemId,
      thumbsUp: ir.thumbsUp
    })) : [];

    const feedback = await prisma.feedback.create({
      data: {
        restaurantId,
        orderId,
        tableId,
        overallRating: data.overallRating,
        comment: data.comment ? sanitizeHtml(data.comment) : null,
        itemRatings: {
          create: itemRatingsData
        }
      },
      include: {
        itemRatings: true
      }
    });

    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

export const getFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const { rating, reviewed, startDate, endDate } = req.query;

    const whereClause: any = { restaurantId };
    
    if (rating) {
      whereClause.overallRating = parseInt(rating as string, 10);
    }
    
    if (reviewed !== undefined) {
      whereClause.isReviewed = reviewed === 'true'; // Wait, schema uses `isReviewed` not `reviewed` based on what I see in `schema.prisma` lines 274 (`isReviewed Boolean @default(false)`).
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        table: true,
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(feedbacks);
  } catch (error) {
    next(error);
  }
};

export const getFeedbackById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;

    const feedback = await prisma.feedback.findFirst({
      where: { id, restaurantId },
      include: {
        table: true,
        order: {
          include: {
            items: {
              include: {
                menuItem: true
              }
            }
          }
        },
        itemRatings: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!feedback) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

export const markFeedbackReviewed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;
    const id = req.params.id as string;

    const feedback = await prisma.feedback.findFirst({
      where: { id, restaurantId }
    });

    if (!feedback) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: { isReviewed: true }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getFeedbackInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user!.restaurantId;

    // Aggregation query: count of feedback below 3 stars grouped by associated menu item
    // Since itemRatings are stored in FeedbackItemRating with boolean thumbsUp,
    // "below 3 stars" is represented by overallRating OR thumbsUp = false.
    // The prompt says: "count of feedback below 3 stars grouped by associated menu item and by day-of-week/time-of-day"
    // Wait, the prompt specifically asks for "feedback below 3 stars".
    // Let's use Prisma query raw for grouping by day of week
    
    // Low rating overall insights by day of week
    const lowRatingsByDayRaw: any[] = await prisma.$queryRaw`
      SELECT EXTRACT(ISODOW FROM "createdAt") as day_of_week, COUNT(*) as count
      FROM "Feedback"
      WHERE "restaurantId" = ${restaurantId}::uuid AND "overallRating" < 3
      GROUP BY EXTRACT(ISODOW FROM "createdAt")
      ORDER BY count DESC
    `;

    // Item ratings thumbs down
    const thumbsDownItems = await prisma.feedbackItemRating.groupBy({
      by: ['menuItemId'],
      where: {
        thumbsUp: false,
        feedback: { restaurantId }
      },
      _count: {
        menuItemId: true
      },
      orderBy: {
        _count: {
          menuItemId: 'desc'
        }
      },
      take: 10
    });

    // Resolve menu items
    const menuItemIds = thumbsDownItems.map(t => t.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true }
    });

    const itemInsights = thumbsDownItems.map(t => ({
      menuItemId: t.menuItemId,
      name: menuItems.find(m => m.id === t.menuItemId)?.name || 'Unknown',
      downvotes: t._count.menuItemId
    }));

    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // ISODOW 1-7
    
    const dayInsights = lowRatingsByDayRaw.map(r => ({
      dayOfWeek: daysMap[Number(r.day_of_week)],
      count: Number(r.count)
    }));

    res.json({
      problematicItems: itemInsights,
      lowRatingsByDay: dayInsights
    });
  } catch (error) {
    next(error);
  }
};
