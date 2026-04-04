import { useState, useEffect, useCallback } from 'react';
import AlertBanner from '../components/AlertBanner';
import ReorderBanner from '../components/ReorderBanner';

const TransactionCard = ({ t }) => {
  const isIncome = t.type === "income";
  const methodColor =
    t.payment_method === 'upi'    ? 'bg-blue-400'  :
    t.payment_method === 'udhari' ? 'bg-red-400'   : 'bg-green-400';

  return (
    <div className="flex justify-between items-center bg-section p-4 rounded-xl border border-border mb-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${methodColor} shadow-lg flex-shrink-0`}></div>
        <div>
          <p className="text-text-primary text-sm font-medium font-heading tracking-wide italic">{t.category || "General"}</p>
          <p className="text-label text-[10px] uppercase font-black tracking-[0.2em]">{t.payment_method}</p>
        </div>
      </div>
      <div className={`font-semibold text-lg tracking-tight ${isIncome ? "text-money-pos" : "text-money-neg"}`}>
        <span className="text-xs mr-0.5">{isIncome ? "↑" : "↓"}</span>₹{t.amount}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState({
    totalSales: 0,
    totalExpense: 0,
    profit: 0,
    cash: 0,
    upi: 0,
    udhari: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async () => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    try {
      const [dashRes, txRes, stockRes] = await Promise.all([
        fetch('/api/transactions/dashboard',  { headers }),
        fetch('/api/transactions/today',      { headers }),
        fetch('/api/products/reorder-alerts', { headers }),
      ]);

      if (dashRes.ok) {
        const d = await dashRes.json();
        setData({
          totalSales:   Number(d.totalSales)   || 0,
          totalExpense: Number(d.totalExpense)  || 0,
          profit:       Number(d.profit)        || 0,
          cash:         Number(d.cash)          || 0,
          upi:          Number(d.upi)           || 0,
          udhari:       Number(d.udhari)        || 0,
        });
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(Array.isArray(txData) ? txData : []);
      }

      if (stockRes.ok) {
        const stocks = await stockRes.json();
        setLowStockCount(Array.isArray(stocks) ? stocks.length : 0);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Speak greeting once per session
    const speakGreeting = () => {
      if (!window.speechSynthesis) {
        console.log("Speech Synthesis not available");
        return;
      }

      if (sessionStorage.getItem("greeted")) {
        console.log("Already greeted in this session");
        return;
      }

      // Get IST time
      const istTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      const hour = new Date(istTime).getHours();

      let message = "";

      if (hour < 12) {
        message = "శుభోదయం";
      } else if (hour < 17) {
        message = "శుభ మధ్యాహ్నం";
      } else if (hour < 21) {
        message = "శుభ సాయంత్రం";
      } else {
        message = "శుభ రాత్రి";
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "te-IN";
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        console.log("Greeting started:", message);
        sessionStorage.setItem("greeted", "true");
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
      };

      window.speechSynthesis.cancel();
      
      // Small delay to ensure voices are loaded
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        console.log("Greeting spoken:", message);
      }, 100);
    };

    // Call greeting with delay
    const greetingTimer = setTimeout(() => {
      speakGreeting();
    }, 500);

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    
    return () => {
      clearTimeout(greetingTimer);
      clearInterval(interval);
    };
  }, [fetchDashboard]);

  const upiTransactions = transactions
    .filter(t => t.payment_method === "upi")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const udhariTransactions = transactions
    .filter(t => t.payment_method === "udhari" || t.payment_method === "cash")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const stockBarCount = Math.min(lowStockCount, 5);

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary text-sm italic font-heading animate-pulse">Analyzing activity...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-dark via-section to-dark pb-32">
      <ReorderBanner />
      <AlertBanner />

      {/* ── Header ── */}
      <div className="px-6 py-8 border-b border-border bg-card/30 backdrop-blur-sm mb-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase font-black tracking-[0.5em] text-label mb-2">Operational Overview</p>
            <h1 className="text-3xl font-heading font-medium text-text-primary tracking-tight italic">Daily Activity</h1>
            {lastUpdated && (
              <p className="text-[9px] text-label mt-1 uppercase tracking-widest">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchDashboard}
            className="w-12 h-12 flex items-center justify-center bg-card rounded-2xl border border-border active:scale-95 transition-all hover:border-neon shadow-lg group"
            title="Refresh"
          >
            <span className="text-xl group-hover:rotate-180 transition-transform duration-500">🔄</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-10">

        {/* ── Top Summary Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Today Sales */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-label">Today Sales</span>
              <span className="text-xl">💰</span>
            </div>
            <p className="text-2xl font-heading font-bold text-neon tracking-tight italic">₹{data.totalSales}</p>
            <div className="mt-4 h-1 w-full bg-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-neon rounded-full transition-all duration-1000"
                style={{ width: data.totalSales > 0 ? '70%' : '0%' }}
              />
            </div>
          </div>

          {/* Profit */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-label">Profit</span>
              <span className="text-xl">📈</span>
            </div>
            <p className={`text-2xl font-heading font-bold tracking-tight italic ${data.profit >= 0 ? 'text-money-pos' : 'text-money-neg'}`}>
              {data.profit >= 0 ? '↑' : '↓'} ₹{Math.abs(data.profit)}
            </p>
            <p className="text-[8px] uppercase font-bold text-label mt-2 tracking-widest">
              Sales ₹{data.totalSales} · Expense ₹{data.totalExpense}
            </p>
          </div>

          {/* Low Stock */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-label">Low Stock</span>
              <span className="text-xl">📦</span>
            </div>
            <p className={`text-2xl font-heading font-bold tracking-tight italic ${lowStockCount > 0 ? 'text-money-neg' : 'text-neon'}`}>
              {lowStockCount}
            </p>
            <div className="mt-4 flex gap-1">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i < stockBarCount ? 'bg-money-neg' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Payment Method Split ── */}
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-10">

          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col items-center justify-center hover:border-neon/50 transition-all shadow-xl">
            <div className="w-2 h-2 rounded-full bg-green-400 mb-3" />
            <span className="text-[10px] uppercase font-black text-label tracking-widest mb-2">Cash</span>
            <span className={`text-2xl font-heading font-bold tracking-tight italic ${data.cash >= 0 ? 'text-text-primary' : 'text-money-neg'}`}>
              ₹{data.cash}
            </span>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col items-center justify-center hover:border-neon/50 transition-all shadow-xl">
            <div className="w-2 h-2 rounded-full bg-blue-400 mb-3" />
            <span className="text-[10px] uppercase font-black text-label tracking-widest mb-2">Digital</span>
            <span className={`text-2xl font-heading font-bold tracking-tight italic ${data.upi >= 0 ? 'text-text-primary' : 'text-money-neg'}`}>
              ₹{data.upi}
            </span>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col items-center justify-center hover:border-money-neg/50 transition-all shadow-xl">
            <div className="w-2 h-2 rounded-full bg-red-400 mb-3" />
            <span className="text-[10px] uppercase font-black text-label tracking-widest mb-2">Udhari</span>
            <span className={`text-2xl font-heading font-bold tracking-tight italic ${data.udhari >= 0 ? 'text-text-primary' : 'text-money-neg'}`}>
              ₹{data.udhari}
            </span>
          </div>
        </div>

        {/* ── Transaction Lists ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">

          {/* UPI Stream */}
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h3 className="font-heading font-medium text-text-primary text-xl italic flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></span>
                UPI Stream
              </h3>
              <span className="text-[9px] font-black uppercase text-neon tracking-[0.3em]">₹{data.upi} net</span>
            </div>
            <div className="space-y-1">
              {upiTransactions.length === 0 ? (
                <div className="text-label text-[10px] uppercase font-black tracking-widest py-20 bg-card/50 rounded-3xl border border-dashed border-border text-center">
                  No UPI today
                </div>
              ) : upiTransactions.map(t => <TransactionCard key={t.id} t={t} />)}
            </div>
          </div>

          {/* Ledger History */}
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h3 className="font-heading font-medium text-text-primary text-xl italic flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"></span>
                Ledger History
              </h3>
              <span className="text-[9px] font-black uppercase text-money-neg tracking-[0.3em]">₹{data.udhari} udhari</span>
            </div>
            <div className="space-y-1">
              {udhariTransactions.length === 0 ? (
                <div className="text-label text-[10px] uppercase font-black tracking-widest py-20 bg-card/50 rounded-3xl border border-dashed border-border text-center">
                  Empty Log
                </div>
              ) : udhariTransactions.map(t => <TransactionCard key={t.id} t={t} />)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
