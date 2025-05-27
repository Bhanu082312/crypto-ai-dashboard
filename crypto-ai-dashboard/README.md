# Crypto AI Dashboard 🚀💹

An AI-powered crypto trading assistant with live price predictions, strategy comparison, backtesting, and simulated trading — auto-deployed on Render + Vercel.

## 🧠 Features
- AI price prediction (via ML models)
- Trading signal generation (BUY/SELL)
- Built-in strategies: RSI, MACD, EMA, AI
- Live alerts and position simulation
- Interactive charting (Line, Bar)
- Full CI/CD with GitHub Actions
- Backend on Render / Frontend on Vercel

## 🚀 Live URLs
- Frontend: `https://your-vercel-url.vercel.app`
- Backend: `https://your-api-url.onrender.com`

## 📦 Local Setup
### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📬 API Endpoints
- `POST /predict` → `{ prices: [float] }` → `prediction, signal`
- `POST /backtest` → `{ prices: [float], strategy: 'AI'|'RSI'|'MACD'|'EMA' }`

## ✅ License
MIT — use freely and responsibly.
