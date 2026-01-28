# 🔨 Live Bidding Platform

A real-time auction platform where users compete to buy items in the final seconds. Built with MERN stack and Socket.io for instant bid updates.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6-black)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4)

## 🌐 Live Demo

- **Frontend:** [https://live-bidding-platform.vercel.app](https://live-bidding-platform.vercel.app)
- **Backend API:** [https://live-bidding-backend.onrender.com](https://live-bidding-backend.onrender.com)

## ✨ Features

- **Real-time Bidding** - Instant bid updates via WebSocket
- **Race Condition Handling** - Optimistic locking ensures fair bidding when multiple users bid simultaneously
- **Server-Synced Timers** - Countdown timers sync with server time (tamper-proof)
- **Visual Feedback** - Green flash on new bids, "Winning" badge, "Outbid" alerts
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Auto-reconnection** - Handles connection drops gracefully

## 🖼️ Screenshots

### Auction Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Auction+Dashboard)

### Real-time Bidding
![Bidding](https://via.placeholder.com/800x400?text=Real-time+Bidding)

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.io
- **Concurrency:** Optimistic Locking with Version Control

### Frontend
- **Library:** React 18
- **Styling:** Tailwind CSS 4.1
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client

## 📁 Project Structure

```
live-bidding-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── Item.js
│   │   │   └── Bid.js
│   │   ├── controllers/
│   │   │   └── itemController.js
│   │   ├── routes/
│   │   │   └── itemRoutes.js
│   │   ├── services/
│   │   │   └── bidService.js
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── app.js
│   │   └── seed.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuctionCard.jsx
│   │   │   ├── AuctionGrid.jsx
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Toast.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js
│   │   ├── context/
│   │   │   └── SocketContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/live-bidding-platform.git
   cd live-bidding-platform
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Backend Environment**
   
   Create `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/live-bidding
   CLIENT_URL=http://localhost:5173
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Configure Frontend Environment**
   
   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Seed the Database**
   ```bash
   cd backend
   npm run seed
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start Frontend** (new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open Browser**
   ```
   http://localhost:5173
   ```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/time` | Server time (for sync) |
| GET | `/api/items` | List all active auctions |
| GET | `/api/items/:id` | Get single item details |
| GET | `/api/items/:id/bids` | Get bid history for item |

## 🔌 Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `IDENTIFY` | `{userId, userName}` | Register user identity |
| `BID_PLACED` | `{itemId, bidderId, bidderName, bidAmount}` | Place a bid |
| `TIME_SYNC` | - | Request server time |
| `JOIN_AUCTION` | `itemId` | Join auction room |
| `LEAVE_AUCTION` | `itemId` | Leave auction room |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `UPDATE_BID` | `{itemId, currentBid, currentBidderId, ...}` | Broadcast new bid to all |
| `BID_ACCEPTED` | `{itemId, amount, bidCount}` | Confirm bid to bidder |
| `BID_REJECTED` | `{itemId, error, message}` | Reject invalid bid |
| `OUTBID_NOTIFICATION` | `{itemId, itemTitle, newBid}` | Notify outbid user |
| `SERVER_TIME` | `{serverTime, timestamp}` | Time sync response |
| `AUCTIONS_UPDATED` | `{count, serverTime}` | Notify when auctions end |

## 🔒 Race Condition Handling

The platform handles concurrent bids using **optimistic locking**:

```javascript
// Atomic update with version check
const updatedItem = await Item.findOneAndUpdate(
  { 
    _id: itemId, 
    version: item.version,        // Must match current version
    currentBid: { $lt: bidAmount } // Bid must be higher
  },
  {
    $set: { currentBid: bidAmount, ... },
    $inc: { version: 1 }          // Increment version
  },
  { new: true, session }
);

// If null → another bid was placed first → return OUTBID error
```

This ensures that if two users bid at the exact same millisecond, only one succeeds.

## 🕐 Time Synchronization

Client timers sync with server time to prevent manipulation:

1. Server sends `SERVER_TIME` on connect and every 30 seconds
2. Client calculates offset: `offset = serverTime - clientTime`
3. Countdown uses synchronized time: `new Date(Date.now() + offset)`

## 🌐 Deployment

### Backend (Render)

1. Create Web Service on [Render](https://render.com)
2. Connect GitHub repo
3. Set Root Directory: `backend`
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_atlas_uri`
   - `CLIENT_URL=your_vercel_frontend_url`

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Set Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Add Environment Variables:
   - `VITE_API_URL=your_render_backend_url`
   - `VITE_SOCKET_URL=your_render_backend_url`

### Database (MongoDB Atlas)

1. Create free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create database user
3. Whitelist all IPs (0.0.0.0/0)
4. Get connection string and use in backend

## 🧪 Testing the Application

### Manual Testing

1. **Open two browser windows** (one regular, one incognito)
2. **Place a bid** from one window
3. **Watch the other window** update instantly with green flash
4. **Try bidding from both** at the same time to test race condition handling
5. **Watch the countdown** - both windows show identical time

### API Testing with cURL

You can test the REST API endpoints using cURL or Postman:

#### Health Check
```bash
curl http://localhost:5000/api/health
```
**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 123.456,
  "serverTime": "2024-01-15T10:30:00.000Z"
}
```

#### Get Server Time
```bash
curl http://localhost:5000/api/time
```
**Expected Response:**
```json
{
  "success": true,
  "serverTime": "2024-01-15T10:30:00.000Z",
  "timestamp": 1705315800000
}
```

#### Get All Auction Items
```bash
curl http://localhost:5000/api/items
```
**Expected Response:**
```json
{
  "success": true,
  "serverTime": "2024-01-15T10:30:00.000Z",
  "timestamp": 1705315800000,
  "count": 6,
  "items": [
    {
      "_id": "65a4f8e2c1234567890abcdef",
      "title": "Vintage Rolex Submariner",
      "description": "Classic 1960s Rolex Submariner in excellent condition",
      "imageUrl": "https://images.unsplash.com/...",
      "startingPrice": 5000,
      "currentBid": 5000,
      "currentBidderId": null,
      "currentBidderName": null,
      "auctionEndTime": "2024-01-15T12:30:00.000Z",
      "bidIncrement": 100,
      "bidCount": 0,
      "status": "active",
      "version": 0
    }
  ]
}
```

#### Get Single Item by ID
```bash
curl http://localhost:5000/api/items/65a4f8e2c1234567890abcdef
```
**Expected Response:**
```json
{
  "success": true,
  "serverTime": "2024-01-15T10:30:00.000Z",
  "item": {
    "_id": "65a4f8e2c1234567890abcdef",
    "title": "Vintage Rolex Submariner",
    "currentBid": 5100,
    "currentBidderId": "user_123",
    "currentBidderName": "SharpBidder95",
    "bidCount": 1
  }
}
```

#### Get Bid History for Item
```bash
curl http://localhost:5000/api/items/65a4f8e2c1234567890abcdef/bids
```
**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "bids": [
    {
      "_id": "65a4f9a1c1234567890abcd01",
      "itemId": "65a4f8e2c1234567890abcdef",
      "bidderId": "user_456",
      "bidderName": "QuickEagle42",
      "amount": 5200,
      "previousBid": 5100,
      "status": "accepted",
      "serverTimestamp": "2024-01-15T10:35:00.000Z"
    },
    {
      "_id": "65a4f9a1c1234567890abcd00",
      "itemId": "65a4f8e2c1234567890abcdef",
      "bidderId": "user_123",
      "bidderName": "SharpBidder95",
      "amount": 5100,
      "previousBid": 5000,
      "status": "outbid",
      "serverTimestamp": "2024-01-15T10:32:00.000Z"
    }
  ]
}
```

#### Get Bid History with Limit
```bash
curl http://localhost:5000/api/items/65a4f8e2c1234567890abcdef/bids?limit=5
```

### API Testing with Postman

1. **Import Collection** - Create a new collection named "Live Bidding API"

2. **Add Requests:**

| Request Name | Method | URL |
|--------------|--------|-----|
| Health Check | GET | `{{base_url}}/api/health` |
| Server Time | GET | `{{base_url}}/api/time` |
| Get All Items | GET | `{{base_url}}/api/items` |
| Get Item by ID | GET | `{{base_url}}/api/items/:id` |
| Get Item Bids | GET | `{{base_url}}/api/items/:id/bids` |

3. **Set Environment Variables:**
   - `base_url`: `http://localhost:5000` (local)
   - `base_url`: `https://live-bidding-backend.onrender.com` (production)

### Socket.io Testing

You can test WebSocket events using the browser console:

```javascript
// Open browser console on http://localhost:5173

// Check connection status
console.log(window.socket?.connected); // true

// Listen to all bid updates
window.socket?.on('UPDATE_BID', (data) => {
  console.log('New bid:', data);
});

// Listen to outbid notifications
window.socket?.on('OUTBID_NOTIFICATION', (data) => {
  console.log('You were outbid:', data);
});
```

### Testing Race Conditions

To test concurrent bid handling:

1. **Open 3+ browser windows** on the same auction item
2. **Prepare bids** in each window (don't click yet)
3. **Click "Bid" simultaneously** in all windows
4. **Expected Result:** Only ONE bid succeeds, others get "OUTBID" error
5. **Verify:** Check `/api/items/:id/bids` - only one bid recorded at that amount

### Error Response Examples

#### Item Not Found (404)
```bash
curl http://localhost:5000/api/items/invalidid123
```
```json
{
  "success": false,
  "error": "Invalid ID format"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "error": "Server Error",
  "message": "Something went wrong"
}
```

### WebSocket Error Events

| Event | When | Response |
|-------|------|----------|
| `BID_REJECTED` | Bid too low | `{error: "BID_TOO_LOW", message: "Bid must be at least $5100"}` |
| `BID_REJECTED` | Auction ended | `{error: "AUCTION_ENDED", message: "This auction has ended"}` |
| `BID_REJECTED` | Already winning | `{error: "ALREADY_WINNING", message: "You are already the highest bidder"}` |
| `BID_REJECTED` | Race condition | `{error: "OUTBID", message: "Someone placed a higher bid!"}` |
| `BID_ERROR` | Server error | `{error: "SERVER_ERROR", message: "Failed to process bid"}` |

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/live-bidding
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [PRATYAKSH15](https://github.com/PRATYAKSH15)
- LinkedIn: [Pratyaksh](https://www.linkedin.com/in/pratyaksh-989922256/)

---

⭐ If you found this project helpful, please give it a star!
