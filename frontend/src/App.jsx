import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import AuctionGrid from './components/AuctionGrid';
import { ToastContainer } from './components/Toast';
import { useSocket } from './hooks/useSocket';
import { getItems } from './services/api';

const App = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const socketHandlers = useMemo(() => ({
    UPDATE_BID: (data) => {
      setItems(prev => prev.map(item => 
        item._id === data.itemId 
          ? { 
              ...item, 
              currentBid: data.currentBid,
              currentBidderId: data.currentBidderId,
              currentBidderName: data.currentBidderName,
              bidCount: data.bidCount
            }
          : item
      ));
    },

    BID_ACCEPTED: (data) => {
      addToast(`Bid of $${data.amount} accepted!`, 'success');
    },

    BID_REJECTED: (data) => {
      addToast(data.message || 'Bid rejected', 'error');
    },

    BID_ERROR: (data) => {
      addToast(data.message || 'Bid error', 'error');
    },

    OUTBID_NOTIFICATION: (data) => {
      addToast(`You've been outbid on "${data.itemTitle}"!`, 'warning');
    },

    AUCTIONS_UPDATED: () => {
      fetchItems();
    }
  }), [addToast]);

  const { connected, userId, placeBid } = useSocket(socketHandlers);

  const fetchItems = useCallback(async () => {
    try {
      const data = await getItems();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      addToast('Failed to load auctions', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 120000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  const handleBid = useCallback((itemId, amount) => {
    if (!connected) {
      addToast('Not connected to server', 'error');
      return;
    }
    placeBid(itemId, amount);
  }, [connected, placeBid, addToast]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Live Auctions</h2>
          <p className="text-gray-400 mt-1">
            {items.length} active auction{items.length !== 1 ? 's' : ''} • 
            Prices update in real-time
          </p>
        </div>

        <AuctionGrid 
          items={items}
          loading={loading}
          onBid={handleBid}
          userId={userId}
        />
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {!connected && !loading && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 
          bg-yellow-500/90 text-yellow-900 px-4 py-3 rounded-lg shadow-lg
          flex items-center gap-3 backdrop-blur-sm">
          <div className="w-2 h-2 bg-yellow-900 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Reconnecting to server...</span>
        </div>
      )}
    </div>
  );
};

export default App;