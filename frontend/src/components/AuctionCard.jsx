import { useState, useEffect, useCallback } from 'react';
import { Gavel, TrendingUp, Trophy, AlertTriangle, Users } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { formatCurrency } from '../utils/helpers';
import { useSocketContext } from '../context/SocketContext';

const AuctionCard = ({ item, onBid, userId }) => {
  const { getServerTime } = useSocketContext();
  const [isFlashing, setIsFlashing] = useState(null);
  const [prevBid, setPrevBid] = useState(item.currentBid);
  const [isEnded, setIsEnded] = useState(false);
  const [bidding, setBidding] = useState(false);

  const isWinning = item.currentBidderId === userId;
  const wasOutbid = prevBid < item.currentBid && !isWinning && prevBid !== item.startingPrice;

  useEffect(() => {
    if (item.currentBid !== prevBid) {
      setIsFlashing('green');
      setPrevBid(item.currentBid);
      
      const timer = setTimeout(() => setIsFlashing(null), 600);
      return () => clearTimeout(timer);
    }
  }, [item.currentBid, item.currentBidderId, prevBid, userId, item.startingPrice]);

  const handleBid = useCallback(() => {
    if (isEnded || bidding) return;
    setBidding(true);
    const newBid = item.currentBid + item.bidIncrement;
    onBid(item._id, newBid);
    setTimeout(() => setBidding(false), 500);
  }, [item, onBid, isEnded, bidding]);

  const handleAuctionEnd = useCallback(() => {
    setIsEnded(true);
  }, []);

  useEffect(() => {
    const serverNow = getServerTime();
    if (new Date(item.auctionEndTime) <= serverNow) {
      setIsEnded(true);
    }
  }, [item.auctionEndTime, getServerTime]);

  return (
    <div 
      className={`
        relative bg-gray-800/80 rounded-xl overflow-hidden border transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl
        ${isFlashing === 'green' ? 'animate-flash-green card-glow-green' : ''}
        ${isFlashing === 'red' ? 'animate-flash-red card-glow-red' : ''}
        ${isWinning ? 'border-green-500/50' : 'border-gray-700/50'}
        ${isEnded ? 'opacity-75' : ''}
      `}
    >
      {isWinning && !isEnded && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
          <Trophy className="w-3.5 h-3.5" />
          WINNING
        </div>
      )}
      
      {wasOutbid && !isWinning && !isEnded && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          OUTBID
        </div>
      )}

      {isEnded && (
        <div className="absolute top-3 right-3 z-10 bg-gray-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          ENDED
        </div>
      )}

      <div className="relative h-48 bg-gray-900">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gavel className="w-16 h-16 text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 to-transparent" />
      </div>

      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-lg text-white truncate">{item.title}</h3>
        
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-gray-400 text-sm">Current Bid</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className={`text-2xl font-bold ${isWinning ? 'text-green-400' : 'text-white'}`}>
                {formatCurrency(item.currentBid)}
              </span>
            </div>
          </div>
          
          {item.currentBidderName && (
            <p className="text-xs text-gray-500">
              by {item.currentBidderId === userId ? 'You' : item.currentBidderName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between py-2 border-t border-gray-700/50">
          <span className="text-gray-400 text-sm">Time Left</span>
          <CountdownTimer endTime={item.auctionEndTime} onEnd={handleAuctionEnd} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {item.bidCount} bids
          </span>
          <span>+{formatCurrency(item.bidIncrement)} increment</span>
        </div>

        <button
          onClick={handleBid}
          disabled={isEnded || bidding || isWinning}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-sm
            flex items-center justify-center gap-2 transition-all duration-200
            ${isEnded 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : isWinning
                ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
            }
            ${bidding ? 'opacity-75' : ''}
          `}
        >
          <Gavel className="w-4 h-4" />
          {isEnded 
            ? 'Auction Ended' 
            : isWinning 
              ? "You're Winning!" 
              : `Bid ${formatCurrency(item.currentBid + item.bidIncrement)}`
          }
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;