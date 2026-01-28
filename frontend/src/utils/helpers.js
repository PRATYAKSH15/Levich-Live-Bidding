export const getUserId = () => {
  let userId = localStorage.getItem('bidding_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('bidding_user_id', userId);
  }
  return userId;
};

export const getUserName = () => {
  let name = localStorage.getItem('bidding_user_name');
  if (!name) {
    const adjectives = ['Swift', 'Bold', 'Lucky', 'Sharp', 'Clever', 'Quick'];
    const nouns = ['Bidder', 'Trader', 'Hunter', 'Eagle', 'Tiger', 'Wolf'];
    name = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`;
    localStorage.setItem('bidding_user_name', name);
  }
  return name;
};

export const setUserName = (name) => {
  localStorage.setItem('bidding_user_name', name);
  return name;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatTimeRemaining = (ms) => {
  if (ms <= 0) return { text: 'ENDED', urgent: true };
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return { 
      text: `${hours}h ${minutes % 60}m ${seconds % 60}s`,
      urgent: false
    };
  }
  if (minutes > 0) {
    return { 
      text: `${minutes}m ${seconds % 60}s`,
      urgent: minutes < 5
    };
  }
  return { 
    text: `${seconds}s`,
    urgent: true
  };
};