import bidService from '../services/bidService.js';

export const getItems = async (req, res, next) => {
  try {
    const items = await bidService.getActiveItems();
    const serverTime = new Date();
    
    res.json({
      success: true,
      serverTime: serverTime.toISOString(),
      timestamp: serverTime.getTime(),
      count: items.length,
      items
    });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await bidService.getItemById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      item
    });
  } catch (error) {
    next(error);
  }
};

export const getItemBids = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const bids = await bidService.getBidHistory(req.params.id, limit);
    
    res.json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    next(error);
  }
};

export const getServerTime = (req, res) => {
  const now = new Date();
  res.json({
    success: true,
    serverTime: now.toISOString(),
    timestamp: now.getTime()
  });
};

export const healthCheck = (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    serverTime: new Date().toISOString()
  });
};