# 🏪 Dukaan AI - AI-Powered Business Summary & Expense Tracker

An intelligent daily business summary and expense tracking application designed for small shop owners. Log sales and expenses via voice or text, get AI-generated insights, and track weekly profit/loss trends with minimal complexity.

**🌐 [Try Live Demo](https://dukaan-ai-frontend.onrender.com)**

---

## 📋 Problem Statement

Small business owners often struggle with:
- 📝 **Manual record keeping** - Time-consuming entry of daily transactions
- 🗣️ **Language barriers** - Need solutions in local languages (Telugu)
- 📊 **Financial visibility** - Difficulty tracking profit/loss at a glance
- 💾 **Data management** - No organized way to store and analyze business data
- 🚀 **Ease of use** - Complex accounting software not suitable for all shop owners

**Dukaan AI solves this by:**
- 🎙️ Voice & text input using AI parsing
- 🤖 Automatic AI-generated summaries in Telugu
- 📈 Visual charts for weekly profit/loss tracking
- 💯 Simple, intuitive interface for non-technical users
- ⚡ Instant categorization and payment tracking

---

## ✨ Key Features

### 1. **Transaction Logging** (Voice & Text)
   - Log sales and expenses via voice or text
   - AI automatically extracts: amount, category, payment method, product name
   - Support for English, Telugu, and mixed languages
   - Confidence scoring for each parsed entry

### 2. **Payment Method Tracking**
   - **Cash** - Physical currency transactions
   - **UPI** - Digital payment tracking
   - **Udhari** - Credit/debt tracking for local business customs

### 3. **AI-Generated Summary**
   - Daily end-of-day summary in Telugu
   - Friendly, non-technical language
   - Highlights: total income, expenses, cash balance, top categories
   - Encourages healthy business practices

### 4. **Charts & Analytics**
   - Weekly profit/loss visualization
   - Real-time income vs. expense comparison
   - Payment method breakdown
   - Category-wise spending analysis

### 5. **Inventory Management**
   - Track low-stock products
   - Product reorder alerts
   - Maintain product database

### 6. **User Authentication**
   - Secure JWT-based authentication
   - Supabase integration for user management
   - Demo mode for testing without login

### 7. **Reports & Exports**
   - Generate PDF reports
   - Transaction history with filters
   - Weekly/monthly summaries

### 8. **Smart Alerts**
   - Low stock notifications
   - Unusual transaction alerts
   - Reorder reminders

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT + Supabase
- **AI:** Groq API (Mixtral LLM)
- **PDF Generation:** PDFKit

### **Frontend**
- **React 19** - UI framework
- **Vite 8** - Build tool (3x faster than Webpack)
- **Tailwind CSS 4** - Utility-first styling
- **React Router v7** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Supabase JS SDK** - Authentication

### **Deployment**
- **Backend:** Render (Node.js)
- **Frontend:** Render (Static Site)
- **Database:** MongoDB Atlas
- **Auth Backend:** Supabase

---

## 📁 Project Structure

```
Dukaan_AI/
├── backend/                 # Express.js Backend
│   ├── server.js           # Main server entry point
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic
│   ├── middlewares/        # Auth, error handling
│   ├── models/             # MongoDB schemas (User, Transaction, Product, Alert)
│   ├── routes/             # API endpoints
│   ├── services/           # AI service (Groq integration)
│   ├── utils/              # Database clients, helpers
│   └── seeds/              # Demo data seeding
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── pages/         # Dashboard, Charts, Alerts, Login, Signup
│   │   ├── components/    # Reusable UI components
│   │   ├── services/      # API client functions
│   │   ├── styles/        # Global styles & theme
│   │   └── utils/         # Helper functions
│   ├── vite.config.js     # Vite configuration
│   └── index.html         # HTML entry point
│
├── render.yaml            # Render deployment config
└── RENDER_DEPLOYMENT.md   # Deployment guide
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v14+)
- MongoDB (local or Atlas)
- Groq API key ([Get it free](https://console.groq.com))
- Supabase account (optional, demo mode works without it)

### **1. Clone Repository**
```bash
git clone https://github.com/your-username/Dukaan_AI.git
cd Dukaan_AI
```

### **2. Setup Backend**
```bash
cd backend
npm install
```

Create `.env` file in `backend/`:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-change-this
GROQ_API_KEY=your-groq-api-key-here
MONGODB_URI=mongodb://localhost:27017/dukaan_ai
# Optional Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

Start backend:
```bash
npm start
```
Backend runs on `http://localhost:5000`

### **3. Setup Frontend**
```bash
cd frontend
npm install
```

Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

### **4. Access Application**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

---

## 📚 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout

### **Transactions**
- `POST /api/transactions` - Log new transaction
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### **Summary**
- `POST /api/summary/generate` - Generate AI summary
- `GET /api/summary` - Get today's summary

### **Charts**
- `GET /api/charts/weekly` - Weekly profit/loss data
- `GET /api/charts/categories` - Category breakdown

### **Products**
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product stock

### **Alerts**
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert

---

## 🎮 How to Use

### **1. Login/Signup**
Create your account with email and password (or use demo mode)

### **2. Log Transaction**
- Click "Add Transaction" button
- **Choose input method:**
  - 🎙️ **Voice:** Speak your transaction (e.g., "Sold 10 kg rice for 500")
  - ✍️ **Text:** Type manual entry
- AI automatically parses and categorizes

### **3. View Dashboard**
- See today's income, expenses, and net profit
- Payment method breakdown (Cash, UPI, Udhari)
- Recent transactions list
- Low stock alerts

### **4. Check Charts**
- Navigate to "Charts" page
- View weekly profit/loss trends
- Category-wise spending breakdown
- Payment method split

### **5. Generate Summary**
- Automatic daily summary in Telugu at end of day
- Or manually generate from "Summary" page
- Share or download as needed

### **6. Manage Inventory**
- Add products to your store
- Track stock levels
- Get alerts for low stock

---

## 🔐 Environment Variables

### **Backend (.env)**
```env
# Server
NODE_ENV=development|production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dukaan_ai

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars

# AI Service
GROQ_API_KEY=gsk_your-groq-key

# Supabase (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Building for Production

### **Build Frontend**
```bash
cd frontend
npm run build
```
Outputs optimized build to `frontend/dist/`

### **Backend Production**
```bash
cd backend
npm start
```
Set `NODE_ENV=production` in `.env`

---

## 🌐 Deployment (Render)

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed deployment guide.

**Quick Deploy:**
1. Push code to GitHub
2. Connect GitHub repo to Render
3. Set environment variables in Render dashboard
4. Deploy both services (backend + frontend)

---

## 🧪 Testing

### **Run Tests**
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### **Demo Data**
```bash
cd backend
node seeds/seedTwoWeeksData.js
```

---

## 📝 API Request Examples

### **Log a Transaction (Voice Input)**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "voice_input": "Sold 5 kg milk powder for 800 rupees via UPI"
  }'
```

### **Get Daily Summary**
```bash
curl http://localhost:5000/api/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Get Weekly Chart Data**
```bash
curl http://localhost:5000/api/charts/weekly \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### **Backend Won't Start**
```bash
# Check MongoDB connection
# Verify .env file exists with correct MONGODB_URI
# Check if port 5000 is free: lsof -i :5000
```

### **Frontend Shows "Cannot Connect to API"**
```bash
# Ensure backend is running
# Check VITE_API_URL in frontend/.env matches backend URL
# Check CORS settings in backend
```

### **AI Parsing Fails**
```bash
# Verify GROQ_API_KEY is correct
# Check rate limits on Groq API
# Try manual entry if voice parsing fails
```

---

## 👨‍💻 Development

### **Tech Used**
- **Express.js** - RESTful API
- **MongoDB** - NoSQL database
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Groq LLM** - AI for parsing

### **Code Structure**
- Controllers: Business logic
- Services: External API integrations (Groq)
- Middlewares: Auth, error handling
- Models: MongoDB schemas
- Routes: API endpoint mapping

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---



