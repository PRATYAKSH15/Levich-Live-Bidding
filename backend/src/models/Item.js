import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    default: ''
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Price cannot be negative']
  },
  currentBid: {
    type: Number,
    default: function() { return this.startingPrice; }
  },
  currentBidderId: {
    type: String,
    default: null
  },
  currentBidderName: {
    type: String,
    default: null
  },
  auctionEndTime: {
    type: Date,
    required: [true, 'Auction end time is required']
  },
  bidIncrement: {
    type: Number,
    default: 10,
    min: 1
  },
  bidCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled'],
    default: 'active'
  },
  version: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

itemSchema.index({ status: 1, auctionEndTime: 1 });
itemSchema.index({ currentBidderId: 1 });

const Item = mongoose.model('Item', itemSchema);

export default Item;