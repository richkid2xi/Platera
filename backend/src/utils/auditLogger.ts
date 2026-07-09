import prisma from './prisma';

interface LogActionParams {
  restaurantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
}

/**
 * Logs an action to the AuditLog.
 * The `action` should be formatted as: "{action} — {entityType} '{entity name/identifier}' by {userName}"
 */
export const logAction = async (params: LogActionParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        restaurantId: params.restaurantId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId
      }
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};
