import 'dotenv/config';
import mongoose from 'mongoose';
import Item from './models/Item.js';

const sampleItems = [
  {
    title: 'Vintage Rolex Submariner',
    description: 'Classic 1960s Rolex Submariner in excellent condition',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
    startingPrice: 5000,
    currentBid: 5000,
    bidIncrement: 100,
    auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
  },
  {
    title: 'MacBook Pro M3 Max',
    description: 'Brand new 16" MacBook Pro with M3 Max, 36GB RAM',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    startingPrice: 2500,
    currentBid: 2500,
    bidIncrement: 50,
    auctionEndTime: new Date(Date.now() + 1 * 60 * 60 * 1000)
  },
  {
    title: 'Signed Michael Jordan Jersey',
    description: 'Authentic Chicago Bulls jersey signed by MJ',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    startingPrice: 1000,
    currentBid: 1000,
    bidIncrement: 25,
    auctionEndTime: new Date(Date.now() + 30 * 60 * 1000)
  },
  {
    title: 'Rare Pokemon Card Collection',
    description: '1st Edition Holographic Charizard + complete base set',
    imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400',
    startingPrice: 800,
    currentBid: 800,
    bidIncrement: 20,
    auctionEndTime: new Date(Date.now() + 45 * 60 * 1000)
  },
  {
    title: 'Sony PlayStation 5 Pro Bundle',
    description: 'PS5 Pro + 2 controllers + 10 top games',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
    startingPrice: 600,
    currentBid: 600,
    bidIncrement: 15,
    auctionEndTime: new Date(Date.now() + 3 * 60 * 60 * 1000)
  },
  {
    title: 'Antique Persian Rug',
    description: 'Hand-woven 19th century Persian rug, 8x10 feet',
    imageUrl: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400',
    startingPrice: 3000,
    currentBid: 3000,
    bidIncrement: 75,
    auctionEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000)
  },
  {
    title: 'Canon EOS R5 Camera Kit',
    description: 'Professional mirrorless camera with 24-70mm f/2.8 lens, 45MP full-frame sensor',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    startingPrice: 3500,
    currentBid: 3500,
    bidIncrement: 100,
    auctionEndTime: addDays(12)
  },
  {
    title: 'Tesla Model S Die-Cast Collection',
    description: 'Limited edition 1:18 scale Tesla Model S Plaid collection, signed by Elon Musk',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
    startingPrice: 1500,
    currentBid: 1500,
    bidIncrement: 50,
    auctionEndTime: addDays(18)
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Item.deleteMany({});
    console.log('🗑️  Cleared existing items');

    const items = await Item.insertMany(sampleItems);
    console.log(`✅ Inserted ${items.length} items:\n`);
    
    items.forEach(item => {
      const endTime = new Date(item.auctionEndTime);
      console.log(`  • ${item.title} - $${item.startingPrice} (ends ${endTime.toLocaleTimeString()})`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();