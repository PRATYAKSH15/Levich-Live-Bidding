import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    index: true
  },
  bidderId: {
    type: String,
    required: true,
    index: true
  },
  bidderName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  previousBid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['accepted', 'rejected', 'outbid'],
    default: 'accepted'
  },
  serverTimestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

bidSchema.index({ itemId: 1, createdAt: -1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;