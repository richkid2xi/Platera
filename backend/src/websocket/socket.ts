import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { env } from '../config/env';
import { verifyToken } from '../utils/jwt';

let io: SocketIOServer | null = null;

export const initWebSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    // Customers joining an order room (public)
    socket.on('join_order', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    // Admins joining a restaurant room (authenticated via connection handshake or emit)
    socket.on('authenticate', (token: string) => {
      try {
        const payload = verifyToken(token);
        socket.join(`restaurant:${payload.restaurantId}`);
      } catch (err) {
        // Invalid token
      }
    });
  });

  return io;
};

export const emitToRestaurant = (restaurantId: string, event: string, data: any) => {
  if (io) {
    io.to(`restaurant:${restaurantId}`).emit(event, data);
  }
};

export const emitToOrder = (orderId: string, event: string, data: any) => {
  if (io) {
    io.to(`order:${orderId}`).emit(event, data);
  }
};
