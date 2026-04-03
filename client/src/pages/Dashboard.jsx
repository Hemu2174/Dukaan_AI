import { useState, useEffect } from 'react';
import AlertBanner from '../components/AlertBanner';
import ReorderBanner from '../components/ReorderBanner';

const TransactionCard = ({ t }) => {
  const isIncome = t.type === "income";
  const methodColor = t.payment_method === 'upi' ? 'bg-blue-400' : t.payment_method === 'udhari' ? 'bg-red-400' : 'bg-green-400';

  return (
    <div className="flex justify-between items-center bg-section p-4 rounded-xl border border-border mb-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${methodColor} shadow-lg`}></div>
        <div>
          <p className="text-text-primary text-sm font-medium font-heading tracking-wide italic">{t.category || "General"}</p>
          <p className="text-label text-[10px] uppercase font-black tracking-[0.2em]">{t.payment_method}</p>
        </div>
      </div>

      <div
        className={`font-semibold text-lg tracking-tight ${
          isIncome ? "text-money-pos" : "text-money-neg"
        }`}
      >
        <span className="text-xs mr-0.5">{isIncome ? "↑" : "↓"}</span>₹{t.amount}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [splits, setSplits] = useState({ 
    cash: { income: 0, expense: 0, net: 0 }, 
    upi: { income: 0, expense: 0, net: 0 }, 
    udhari: 0,
    totals: { income: 0, expense: 0 }
  });
  const safeSplits = {
    cash: splits?.cash ?? { income: 0, expense: 0, net: 0 },
    upi: splits?.upi ?? { income: 0, expense: 0, net: 0 },
    udhari: splits?.udhari ?? 0,
    totals: splits?.totals ?? { income: 0, expense: 0 },
  };
  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [txRes, splRes, stockRes] = await Promise.all([
        fetch('/api/transactions/today', { headers }),
        fetch('/api/payments/split', { headers }),
        fetch('/api/products/reorder-alerts', { headers })
      ]);
      
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(Array.isArray(txData) ? txData : []);
      }
      if (splRes.ok) {
        const splData = await splRes.json();
        setSplits(prev => ({ ...prev, ...splData }));
      }
      if (stockRes.ok) {
        const stocks = await stockRes.json();
        setLowStockCount(Array.isArray(stocks) ? stocks.length : 0);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const upiTransactions = transactions
    .filter((t) => t.payment_method === "upi")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const udhariTransactions = transactions
    .filter((t) => t.payment_method === "udhari" || t.payment_method === "cash")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const todaySales = safeSplits.totals.income ?? 0;
  const todayProfit = (safeSplits.totals.income ?? 0) - (safeSplits.totals.expense ?? 0);
  const stockBarCount = Math.min(lowStockCount, 5);

  if (loading) return <div className="p-10 text-center text-text-secondary animate-pulse italic font-heading">Analyzing activity...</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-dark via-section to-dark pb-32">
      <ReorderBanner />
      <AlertBanner />
      
      {/* Dynamic Header */}
      <div className="px-6 py-8 border-b border-border bg-card/30 backdrop-blur-sm mb-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase font-black tracking-[0.5em] text-label mb-2">Operational Overview</p>
            <h1 className="text-3xl font-heading font-medium text-text-primary tracking-tight italic">Daily Activity</h1>
          </div>
          <button onClick={fetchData} className="w-12 h-12 flex items-center justify-center bg-card rounded-2xl border border-border active:scale-95 transition-all hover:border-neon shadow-lg group" title="Refresh">
            <span className="text-xl group-hover:rotate-180 transition-transform duration-500">🔄</span>
          </button>
        </div>
      </div>

      <div className="px-6 space-y-10">
        {/* Top Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-label">Today Sales</span>
              <span className="text-xl">💰</span>
            </div>
            <p className="text-2xl font-heading font-bold text-neon tracking-tight italic">₹{todaySales}</p>
            <div className="mt-4 h-1 w-full bg-dark rounded-full overflow-hidden">
               <div className="h-full bg-neon w-[70%]" />
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-label">Profit</span>
              <span className="text-xl">📈</span>
            </div>
            <p className={`text-2xl font-heading font-bold ${todayProfit >= 0 ? 'text-money-pos' : 'text-money-neg'} tracking-tight italic`}>
              {todayProfit >= 0 ? '↑' : '↓'} ₹{Math.abs(todayProfit)}
            </p>
            <p className="text-[8px] uppercase font-bold text-label mt-2 tracking-widest">Net Gain Projection</p>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-label">Low Stock</span>
              <span className="text-xl">📦</span>
            </div>
            <p className={`text-2xl font-heading font-bold ${lowStockCount > 0 ? 'text-money-neg' : 'text-neon'} tracking-tight italic`}>{lowStockCount}</p>
            <div className="mt-4 flex gap-1">
               {[0,1,2,3,4].map((i) => (
                 <div key={i} className={`h-1 flex-1 rounded-full ${i < stockBarCount ? 'bg-money-neg' : 'bg-white/10'}`} />
               ))}
            </div>
          </div>
        </div>

        {/* Payment Split Dashboard */}
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-10">
          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-neon/50 transition-all shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mb-3" />
            <span className="text-[10px] uppercase font-black text-label tracking-widest mb-4">Cash</span>
            <span className="text-2xl font-heading font-bold text-text-primary tracking-tight italic">₹{safeSplits.cash.net}</span>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-neon/50 transition-all shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mb-3" />
            <span className="text-[10px] uppercase font-black text-label tracking-widest mb-4">Digital</span>
            <span className="text-2xl font-heading font-bold text-text-primary tracking-tight italic">₹{safeSplits.upi.net}</span>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-money-neg/50 transition-all shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mb-3" />
            <span className="text-[10px] uppercase font-black text-label tracking-widest mb-4">Udhari</span>
            <span className="text-2xl font-heading font-bold text-text-primary tracking-tight italic">₹{safeSplits.udhari}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
          {/* UPI SECTION */}
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h3 className="font-heading font-medium text-text-primary text-xl italic flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></span>
                UPI Stream
              </h3>
              <span className="text-[10px] font-black uppercase text-label tracking-[0.3em]">Ready</span>
            </div>
            <div className="space-y-4">
              {upiTransactions.length === 0 ? (
                <div className="text-label text-[10px] uppercase font-black tracking-widest py-20 bg-card/50 rounded-3xl border border-dashed border-border text-center">
                  Standby Mode
                </div>
              ) : (
                upiTransactions.map((t) => (
                  <TransactionCard key={t.id} t={t} />
                ))
              )}
            </div>
          </div>

          {/* UDHARI SECTION */}
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
              <h3 className="font-heading font-medium text-text-primary text-xl italic flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"></span>
                 Ledger History
              </h3>
              <span className="text-[10px] font-black uppercase text-label tracking-[0.3em]">Updated</span>
            </div>
            <div className="space-y-4">
              {udhariTransactions.length === 0 ? (
                <div className="text-label text-[10px] uppercase font-black tracking-widest py-20 bg-card/50 rounded-3xl border border-dashed border-border text-center">
                  Empty Log
                </div>
              ) : (
                udhariTransactions.map((t) => (
                  <TransactionCard key={t.id} t={t} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
