import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';

export default function CryptoAIDashboard() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [prices, setPrices] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [signal, setSignal] = useState(null);
  const [strategy, setStrategy] = useState('AI');
  const [backtestResult, setBacktestResult] = useState(null);
  const [summaryResults, setSummaryResults] = useState(null);
  const [lastSignal, setLastSignal] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [simulatedBalance, setSimulatedBalance] = useState(10000);
  const [position, setPosition] = useState(null);

  const fetchBinancePrices = async () => {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`);
      const closePrices = res.data.map(k => parseFloat(k[4]));
      setPrices(closePrices);
    } catch (err) {
      console.error('Binance fetch error:', err);
    }
  };

  const fetchPrediction = async () => {
    try {
      const res = await axios.post('https://crypto-ai-dashboard-ddhn.onrender.com/predict', { prices });
      setPrediction(res.data.prediction);
      setSignal(res.data.signal);
      if (res.data.signal !== lastSignal) {
        setAlerts(prev => [...prev, `Signal changed to ${res.data.signal} at $${prices[prices.length - 1]}`]);
        setLastSignal(res.data.signal);
        simulateTrade(res.data.signal);
      }
    } catch (err) {
      console.error('Prediction error:', err);
    }
  };

  const simulateTrade = (newSignal) => {
    const currentPrice = prices[prices.length - 1];
    if (newSignal === 'BUY' && position === null) {
      setPosition({ entry: currentPrice });
    } else if (newSignal === 'SELL' && position) {
      const profit = currentPrice - position.entry;
      setSimulatedBalance(prev => prev + profit);
      setAlerts(prev => [...prev, `Closed position at $${currentPrice} | PnL: $${profit.toFixed(2)}`]);
      setPosition(null);
    }
  };

  const runBacktest = async () => {
    try {
      const res = await axios.post('https://crypto-ai-dashboard-ddhn.onrender.com/backtest', {
        prices,
        strategy
      });
      setBacktestResult(res.data);
    } catch (err) {
      console.error('Backtest error:', err);
    }
  };

  const runAllBacktests = async () => {
    const strategies = ['AI', 'RSI', 'MACD', 'EMA'];
    const results = {};
    for (const s of strategies) {
      try {
        const res = await axios.post('https://crypto-ai-dashboard-ddhn.onrender.com/backtest', {
          prices,
          strategy: s
        });
        results[s] = res.data;
      } catch (err) {
        console.error(`Error in ${s} backtest`, err);
      }
    }
    setSummaryResults(results);
  };

  useEffect(() => {
    fetchBinancePrices();
  }, [symbol]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Crypto AI Dashboard</h1>
      <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
        <option value="BTCUSDT">BTC/USDT</option>
        <option value="ETHUSDT">ETH/USDT</option>
      </select>
      <button onClick={fetchPrediction}>Get Prediction</button>
      <button onClick={runBacktest}>Run Backtest</button>
      <button onClick={runAllBacktests}>Compare All</button>

      {prediction && <p>Prediction: ${prediction.toFixed(2)} - Signal: {signal}</p>}
      {backtestResult && <p>{strategy} → Profit: ${backtestResult.profit.toFixed(2)}</p>}

      <p>Simulated Balance: ${simulatedBalance.toFixed(2)}</p>
      <Line
        data={{
          labels: prices.map((_, i) => `T-${prices.length - i}`),
          datasets: [{
            label: 'Price',
            data: prices,
            borderColor: 'blue',
            tension: 0.1,
          }]
        }}
      />
      {summaryResults && <Bar
        data={{
          labels: Object.keys(summaryResults),
          datasets: [
            {
              label: 'Profit',
              data: Object.values(summaryResults).map(r => r.profit),
              backgroundColor: 'orange'
            },
            {
              label: 'Win Rate %',
              data: Object.values(summaryResults).map(r => r.win_rate * 100),
              backgroundColor: 'green'
            }
          ]
        }}
      />}
      <ul>
        {alerts.slice().reverse().map((alert, i) => <li key={i}>{alert}</li>)}
      </ul>
    </div>
  );
}

