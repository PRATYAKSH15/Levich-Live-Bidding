import { useEffect, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';

export const useSocket = (eventHandlers = {}) => {
  const { socket, connected, userId, userName } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, eventHandlers]);

  const placeBid = useCallback((itemId, bidAmount) => {
    if (!socket?.connected) {
      console.error('Socket not connected');
      return false;
    }

    socket.emit('BID_PLACED', {
      itemId,
      bidderId: userId,
      bidderName: userName,
      bidAmount
    });

    return true;
  }, [socket, userId, userName]);

  const joinAuction = useCallback((itemId) => {
    socket?.emit('JOIN_AUCTION', itemId);
  }, [socket]);

  const leaveAuction = useCallback((itemId) => {
    socket?.emit('LEAVE_AUCTION', itemId);
  }, [socket]);

  return {
    socket,
    connected,
    userId,
    userName,
    placeBid,
    joinAuction,
    leaveAuction
  };
};

export default useSocket;