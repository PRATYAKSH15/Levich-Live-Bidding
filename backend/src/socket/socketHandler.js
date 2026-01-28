import bidService from '../services/bidService.js';

const clients = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    clients.set(socket.id, {
      socketId: socket.id,
      userId: null,
      userName: null,
      connectedAt: Date.now()
    });

    socket.emit('SERVER_TIME', { 
      serverTime: new Date().toISOString(),
      timestamp: Date.now()
    });

    socket.on('IDENTIFY', ({ userId, userName }) => {
      const client = clients.get(socket.id);
      if (client) {
        client.userId = userId;
        client.userName = userName;
        clients.set(socket.id, client);
      }
      socket.userId = userId;
      socket.userName = userName;
      console.log(`👤 User identified: ${userName} (${userId})`);
    });

    socket.on('TIME_SYNC', (clientTimestamp, callback) => {
      const serverTime = Date.now();
      if (typeof callback === 'function') {
        callback({ 
          serverTime, 
          clientTimestamp,
          serverTimeISO: new Date().toISOString()
        });
      } else {
        socket.emit('SERVER_TIME', { 
          serverTime: new Date().toISOString(),
          timestamp: serverTime
        });
      }
    });

    socket.on('BID_PLACED', async (data) => {
      const { itemId, bidderId, bidderName, bidAmount } = data;
      
      console.log(`💰 Bid received: ${bidderName} → $${bidAmount} on ${itemId}`);

      try {
        const result = await bidService.placeBid(
          itemId, bidderId, bidderName, bidAmount
        );

        if (result.success) {
          socket.emit('BID_ACCEPTED', {
            itemId,
            amount: result.item.currentBid,
            bidCount: result.item.bidCount,
            serverTime: result.serverTime
          });

          io.emit('UPDATE_BID', {
            itemId,
            currentBid: result.item.currentBid,
            currentBidderId: result.item.currentBidderId,
            currentBidderName: result.item.currentBidderName,
            bidCount: result.item.bidCount,
            serverTime: result.serverTime
          });

          if (result.previousBidderId) {
            clients.forEach((client, socketId) => {
              if (client.userId === result.previousBidderId) {
                io.to(socketId).emit('OUTBID_NOTIFICATION', {
                  itemId,
                  itemTitle: result.item.title,
                  newBid: result.item.currentBid,
                  outbidBy: result.item.currentBidderName
                });
              }
            });
          }

          console.log(`✅ Bid accepted: $${result.item.currentBid}`);
        } else {
          socket.emit('BID_REJECTED', {
            itemId,
            error: result.error,
            message: result.message,
            currentBid: result.currentBid,
            minimumBid: result.minimumBid
          });
          console.log(`❌ Bid rejected: ${result.error}`);
        }
      } catch (error) {
        console.error('Bid error:', error);
        socket.emit('BID_ERROR', {
          itemId,
          error: 'SERVER_ERROR',
          message: 'Failed to process bid. Try again.'
        });
      }
    });

    socket.on('JOIN_AUCTION', (itemId) => {
      socket.join(`auction:${itemId}`);
    });

    socket.on('LEAVE_AUCTION', (itemId) => {
      socket.leave(`auction:${itemId}`);
    });

    socket.on('disconnect', () => {
      clients.delete(socket.id);
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  setInterval(() => {
    io.emit('SERVER_TIME', { 
      serverTime: new Date().toISOString(),
      timestamp: Date.now()
    });
  }, 30000);

  setInterval(async () => {
    try {
      const count = await bidService.endExpiredAuctions();
      if (count > 0) {
        console.log(`⏰ Ended ${count} expired auctions`);
        io.emit('AUCTIONS_UPDATED', { 
          count,
          serverTime: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error ending auctions:', err);
    }
  }, 60000);

  return io;
};

export default initializeSocket;