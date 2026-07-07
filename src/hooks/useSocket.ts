import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

let globalSocket: Socket | null = null;

/**
 * Returns the singleton Socket.io connection.
 * Reconnection is handled automatically by socket.io-client defaults.
 */
export function getSocket(): Socket {
  if (!globalSocket || !globalSocket.connected) {
    globalSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return globalSocket;
}

/**
 * Hook to join a specific Socket.io room and listen for events.
 * Automatically leaves the room when the component unmounts.
 */
export function useSocketRoom(
  room: string | null | undefined,
  events: Record<string, (data: any) => void>
) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!room) return;

    const socket = getSocket();
    socket.emit('join', room);

    const handlers: Record<string, (data: any) => void> = {};
    Object.keys(eventsRef.current).forEach((event) => {
      handlers[event] = (data: any) => eventsRef.current[event]?.(data);
      socket.on(event, handlers[event]);
    });

    return () => {
      socket.emit('leave', room);
      Object.keys(handlers).forEach((event) => {
        socket.off(event, handlers[event]);
      });
    };
  }, [room]);
}

/**
 * Hook to listen to global socket events (not room-specific).
 */
export function useSocketEvent(event: string, handler: (data: any) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    const listener = (data: any) => handlerRef.current(data);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}
