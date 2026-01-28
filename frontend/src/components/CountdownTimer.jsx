import { useState, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useSocketContext } from '../context/SocketContext';

const CountdownTimer = ({ endTime, onEnd }) => {
  const { getServerTime } = useSocketContext();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const serverNow = getServerTime();
      const end = new Date(endTime);
      const diff = end - serverNow;
      return Math.max(0, diff);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        onEnd?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [endTime, getServerTime, onEnd]);

  const formatted = useMemo(() => {
    if (timeLeft <= 0) return { h: 0, m: 0, s: 0, ms: 0 };
    
    const totalSeconds = Math.floor(timeLeft / 1000);
    return {
      h: Math.floor(totalSeconds / 3600),
      m: Math.floor((totalSeconds % 3600) / 60),
      s: totalSeconds % 60,
      ms: Math.floor((timeLeft % 1000) / 10)
    };
  }, [timeLeft]);

  const isUrgent = timeLeft > 0 && timeLeft < 60000;
  const isEnded = timeLeft <= 0;

  if (isEnded) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">ENDED</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-400' : 'text-gray-300'}`}>
      <Clock className={`w-4 h-4 ${isUrgent ? 'animate-pulse' : ''}`} />
      <div className="font-mono font-semibold tracking-wider">
        {formatted.h > 0 && (
          <span>{String(formatted.h).padStart(2, '0')}:</span>
        )}
        <span>{String(formatted.m).padStart(2, '0')}:</span>
        <span>{String(formatted.s).padStart(2, '0')}</span>
        {isUrgent && (
          <span className="text-xs">.{String(formatted.ms).padStart(2, '0')}</span>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;