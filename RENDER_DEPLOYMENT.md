# Dukaan AI - Render Deployment Guide

## 🚀 Deployment Architecture

- **Backend:** Node.js + Express on Render (Web Service)
- **Frontend:** React on Render (Static Site)
- **Database:** MongoDB Atlas (Cloud MongoDB)
- **Demo Mode:** Auto-enabled without auth

---

## 📋 Prerequisites

1. GitHub account (you have ✅)
2. Render.com account (create free)
3. MongoDB Atlas account (free $200/month credit)
4. Groq API key (you have ✅)

---

## 🔧 Environment Variables Needed

### Backend (.env)
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-here
GROQ_API_KEY=your-groq-api-key-from-console
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dukaan_ai
```

### Frontend (.env)
```
VITE_API_URL=https://dukaan-ai-backend.onrender.com/api
```

