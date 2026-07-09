import { Role, Status } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        restaurantId: string;
        role: Role;
        status: Status;
        name: string;
      };
    }
  }
}
