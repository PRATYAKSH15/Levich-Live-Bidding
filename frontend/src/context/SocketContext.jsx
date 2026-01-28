import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getUserId, getUserName } from '../utils/helpers';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [userId] = useState(getUserId);
  const [userName, setUserName] = useState(getUserName);
  const reconnectAttempts = useRef(0);

  const getServerTime = useCallback(() => {
    return new Date(Date.now() + serverTimeOffset);
  }, [serverTimeOffset]);

  const syncTime = useCallback((serverTimestamp) => {
    const clientTime = Date.now();
    const serverTime = new Date(serverTimestamp).getTime();
    const offset = serverTime - clientTime;
    setServerTimeOffset(offset);
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setConnected(true);
      reconnectAttempts.current = 0;
      
      newSocket.emit('IDENTIFY', { userId, userName });
      newSocket.emit('TIME_SYNC');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected');
      setConnected(false);
    });

    newSocket.on('SERVER_TIME', ({ serverTime }) => {
      syncTime(serverTime);
    });

    newSocket.on('connect_error', () => {
      reconnectAttempts.current++;
      console.log(`Reconnect attempt ${reconnectAttempts.current}`);
    });

    setSocket(newSocket);

    const syncInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('TIME_SYNC');
      }
    }, 30000);

    return () => {
      clearInterval(syncInterval);
      newSocket.close();
    };
  }, [userId, userName, syncTime]);

  const updateUserName = (name) => {
    setUserName(name);
    localStorage.setItem('bidding_user_name', name);
    if (socket?.connected) {
      socket.emit('IDENTIFY', { userId, userName: name });
    }
  };

  const value = {
    socket,
    connected,
    userId,
    userName,
    updateUserName,
    getServerTime,
    serverTimeOffset
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
};