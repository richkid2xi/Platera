import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { env } from '../config/env';
import { verifyToken } from '../utils/jwt';

/** Simple cookie string parser — avoids adding the `cookie` package as a dependency */
function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [key, ...valueParts] = part.trim().split('=');
    if (key) acc[key.trim()] = decodeURIComponent(valueParts.join('=').trim());
    return acc;
  }, {} as Record<string, string>);
}

let io: SocketIOServer | null = null;

export const initWebSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    // Authenticate via the httpOnly session cookie on connection (not via a plaintext socket event)
    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader) {
      try {
        const cookies = parseCookies(cookieHeader);
        const sessionToken = cookies['platera_auth_session'];
        if (sessionToken) {
          const payload = verifyToken(sessionToken);
          // Auto-join the restaurant room — no token ever sent over the wire
          socket.join(`restaurant:${payload.restaurantId}`);
          (socket as any).restaurantId = payload.restaurantId;
        }
      } catch {
        // Invalid or expired token — socket stays as public/unauthenticated
      }
    }

    // Customers joining an order room (public, no auth needed)
    socket.on('join_order', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    // Legacy authenticate event kept for backward compat but now a no-op
    // (authentication happens at connection time via cookie above)
    socket.on('authenticate', () => {
      // No-op: authentication is handled at the handshake level
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
