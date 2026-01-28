import { useState } from 'react';
import { Gavel, Wifi, WifiOff, User, Edit2, Check } from 'lucide-react';
import { useSocketContext } from '../context/SocketContext';

const Header = () => {
  const { connected, userName, updateUserName } = useSocketContext();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const handleSave = () => {
    if (nameInput.trim()) {
      updateUserName(nameInput.trim());
    }
    setEditing(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LiveBid</h1>
              <p className="text-xs text-gray-400">Real-time Auctions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
              ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
            `}>
              {connected ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <User className="w-4 h-4 text-gray-400" />
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="bg-gray-700 text-white text-sm px-2 py-1 rounded w-32 outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button onClick={handleSave} className="text-green-400 hover:text-green-300">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{userName}</span>
                  <button 
                    onClick={() => setEditing(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;