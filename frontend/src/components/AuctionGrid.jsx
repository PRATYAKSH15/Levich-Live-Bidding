import { Loader2 } from 'lucide-react';
import AuctionCard from './AuctionCard';

const AuctionGrid = ({ items, loading, onBid, userId }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="mt-4 text-gray-400">Loading auctions...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🔨</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Active Auctions</h3>
        <p className="text-gray-400">Check back soon for new items!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <AuctionCard
          key={item._id}
          item={item}
          onBid={onBid}
          userId={userId}
        />
      ))}
    </div>
  );
};

export default AuctionGrid;