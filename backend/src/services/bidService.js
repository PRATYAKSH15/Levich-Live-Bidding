import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Bid from '../models/Bid.js';

class BidService {
  async placeBid(itemId, bidderId, bidderName, bidAmount) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      const session = await mongoose.startSession();
      
      try {
        session.startTransaction();
        const serverTime = new Date();

        const item = await Item.findById(itemId).session(session);

        if (!item) {
          await session.abortTransaction();
          session.endSession();
          return { 
            success: false, 
            error: 'ITEM_NOT_FOUND', 
            message: 'Auction item not found' 
          };
        }

        if (item.status !== 'active') {
          await session.abortTransaction();
          session.endSession();
          return { 
            success: false, 
            error: 'AUCTION_INACTIVE', 
            message: 'This auction is no longer active' 
          };
        }

        if (serverTime >= new Date(item.auctionEndTime)) {
          await session.abortTransaction();
          session.endSession();
          return { 
            success: false, 
            error: 'AUCTION_ENDED', 
            message: 'This auction has ended' 
          };
        }

        const minimumBid = item.currentBid + item.bidIncrement;
        if (bidAmount < minimumBid) {
          await session.abortTransaction();
          session.endSession();
          return { 
            success: false, 
            error: 'BID_TOO_LOW', 
            message: `Bid must be at least $${minimumBid}`,
            currentBid: item.currentBid,
            minimumBid
          };
        }

        if (item.currentBidderId === bidderId) {
          await session.abortTransaction();
          session.endSession();
          return { 
            success: false, 
            error: 'ALREADY_WINNING', 
            message: 'You are already the highest bidder' 
          };
        }

        const previousBidderId = item.currentBidderId;
        const previousBid = item.currentBid;

        const updatedItem = await Item.findOneAndUpdate(
          { 
            _id: itemId, 
            version: item.version,
            currentBid: { $lt: bidAmount }
          },
          {
            $set: {
              currentBid: bidAmount,
              currentBidderId: bidderId,
              currentBidderName: bidderName
            },
            $inc: { 
              version: 1,
              bidCount: 1 
            }
          },
          { new: true, session }
        );

        if (!updatedItem) {
          await session.abortTransaction();
          session.endSession();
          
          if (attempt < maxRetries) {
            continue;
          }
          
          return { 
            success: false, 
            error: 'OUTBID', 
            message: 'Someone placed a higher bid! Please try again.' 
          };
        }

        const bid = new Bid({
          itemId,
          bidderId,
          bidderName,
          amount: bidAmount,
          previousBid,
          status: 'accepted',
          serverTimestamp: serverTime
        });
        await bid.save({ session });

        await session.commitTransaction();
        session.endSession();

        return {
          success: true,
          item: updatedItem,
          bid,
          previousBidderId,
          serverTime: serverTime.toISOString()
        };

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        if (attempt < maxRetries) {
          continue;
        }
        throw error;
      }
    }

    return { 
      success: false, 
      error: 'MAX_RETRIES', 
      message: 'Server busy. Please try again.' 
    };
  }

  async getActiveItems() {
    const serverTime = new Date();
    return Item.find({
      status: 'active',
      auctionEndTime: { $gt: serverTime }
    }).sort({ auctionEndTime: 1 });
  }

  async getItemById(itemId) {
    return Item.findById(itemId);
  }

  async getBidHistory(itemId, limit = 20) {
    return Bid.find({ itemId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async endExpiredAuctions() {
    const serverTime = new Date();
    const result = await Item.updateMany(
      { status: 'active', auctionEndTime: { $lte: serverTime } },
      { $set: { status: 'ended' } }
    );
    return result.modifiedCount;
  }
}

export default new BidService();