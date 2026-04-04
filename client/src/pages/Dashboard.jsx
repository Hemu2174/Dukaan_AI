import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertBanner from '../components/AlertBanner';
import ReorderBanner from '../components/ReorderBanner';

const TransactionCard = ({ t }) => {
  const isIncome = t.type === 'income';
  const methodColor =
    t.payment_method === 'upi' ? 'bg-sky-400' :
    t.payment_method === 'udhari' ? 'bg-rose-400' : 'bg-emerald-400';

  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]">
      <div className="flex items-center gap-4">
        <div className={`h-2 w-2 flex-shrink-0 rounded-full ${methodColor} shadow-lg`} />
        <div>
          <p className="text-sm font-medium tracking-wide text-white/90">{t.category || 'General'}</p>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{t.payment_method}</p>
        </div>
      </div>
      <div className={`text-lg font-semibold tracking-tight ${isIncome ? 'text-emerald-300' : 'text-rose-300'}`}>
        <span className="mr-0.5 text-xs">{isIncome ? '↑' : '↓'}</span>₹{t.amount}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

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

  const totalIncome = Number(data.totalSales) || 0;
  const totalExpense = Number(data.totalExpense) || 0;
  const netProfit = Number(data.profit) || 0;
  const paymentSplit = {
    cash: Number(data.cash) || 0,
    upi: Number(data.upi) || 0,
    udhari: Number(data.udhari) || 0,
  };

  const formatAmount = (value) => Number(value || 0).toLocaleString('en-IN');

  const fetchDashboard = useCallback(async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const [dashRes, txRes, stockRes] = await Promise.all([
        fetch('/api/transactions/dashboard', { headers }),
        fetch('/api/transactions/today', { headers }),
        fetch('/api/products/reorder-alerts', { headers }),
      ]);

      if (dashRes.ok) {
        const d = await dashRes.json();
        setData({
          totalSales: Number(d.totalSales) || 0,
          totalExpense: Number(d.totalExpense) || 0,
          profit: Number(d.profit) || 0,
          cash: Number(d.cash) || 0,
          upi: Number(d.upi) || 0,
          udhari: Number(d.udhari) || 0,
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
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const upiTransactions = transactions
    .filter((t) => t.payment_method === 'upi')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const udhariTransactions = transactions
    .filter((t) => t.payment_method === 'udhari' || t.payment_method === 'cash')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const stockBarCount = Math.min(lowStockCount, 5);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
          <p className="text-sm text-white/60">Analyzing activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F1A] pb-12 text-white">
      <ReorderBanner />
      <AlertBanner />

      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 md:px-6 md:pt-6">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Operational Overview</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Dashboard</h1>
              {lastUpdated && (
                <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-white/35">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                onClick={() => navigate('/log')}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.08]"
              >
                Add Transaction
              </button>
              <button
                onClick={() => navigate('/summary')}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0B0F1A] transition-all hover:bg-cyan-100"
              >
                View Summary
              </button>
              <button
                onClick={fetchDashboard}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl transition-all hover:border-white/20 hover:bg-white/[0.08]"
                title="Refresh"
              >
                ⟳
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-[#111827] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-white/40">Total Balance</h2>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">₹{formatAmount(totalIncome)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/55">
                Overview
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-white/80">
              <p className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3"><span>Cash</span><span>₹{formatAmount(paymentSplit.cash)}</span></p>
              <p className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3"><span>UPI</span><span>₹{formatAmount(paymentSplit.upi)}</span></p>
              <p className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3"><span>Udhari</span><span>₹{formatAmount(paymentSplit.udhari)}</span></p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <button onClick={() => navigate('/log')} className="rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-[#0B0F1A] transition-all hover:bg-cyan-100">+ Add</button>
              <button onClick={() => navigate('/summary')} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white transition-all hover:bg-white/[0.08]">View</button>
              <button onClick={() => navigate('/chart')} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white transition-all hover:bg-white/[0.08]">Analytics</button>
              <button onClick={() => navigate('/alerts')} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white transition-all hover:bg-white/[0.08]">Alerts</button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#111827] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Live</span>
            </div>

            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-[10px] font-black uppercase tracking-[0.26em] text-white/35">
                  No recent transactions
                </div>
              ) : recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-white">{t.category || 'General'}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">{t.payment_method || 'cash'}</p>
                  </div>
                  <span className={t.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}>
                    {t.type === 'income' ? '+' : '-'}₹{formatAmount(t.amount)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/log')}
              className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/[0.08]"
            >
              View All Transactions
            </button>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#111827] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:col-span-1">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Quick Actions</h2>
            <p className="mt-2 text-sm text-white/50">Move fast without leaving the dashboard.</p>

            <div className="mt-6 space-y-3">
              <button onClick={() => navigate('/log')} className="w-full rounded-2xl bg-white px-4 py-4 text-left text-sm font-semibold text-[#0B0F1A] transition-all hover:bg-cyan-100">
                Add Transaction
              </button>
              <button onClick={() => navigate('/summary')} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm font-semibold text-white transition-all hover:bg-white/[0.08]">
                View Summary
              </button>
              <button onClick={() => navigate('/chart')} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm font-semibold text-white transition-all hover:bg-white/[0.08]">
                Open Analytics
              </button>
              <button onClick={() => navigate('/alerts')} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm font-semibold text-white transition-all hover:bg-white/[0.08]">
                View Alerts
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Inventory Signal</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-white/60">Low stock items</p>
                  <p className="mt-1 text-3xl font-semibold text-white">{lowStockCount}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-12 w-2 rounded-full ${i < stockBarCount ? 'bg-amber-300' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
            <p className="text-sm text-white/40">Total Earnings</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">₹{formatAmount(totalIncome)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
            <p className="text-sm text-white/40">Total Spending</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">₹{formatAmount(totalExpense)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
            <p className="text-sm text-white/40">Net Profit</p>
            <p className="mt-2 text-2xl font-semibold text-sky-300">₹{formatAmount(netProfit)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Cash</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-2xl font-semibold text-white">₹{formatAmount(paymentSplit.cash)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Digital</span>
              <span className="h-2 w-2 rounded-full bg-sky-400" />
            </div>
            <p className="text-2xl font-semibold text-white">₹{formatAmount(paymentSplit.upi)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Udhari</span>
              <span className="h-2 w-2 rounded-full bg-rose-400" />
            </div>
            <p className="text-2xl font-semibold text-white">₹{formatAmount(paymentSplit.udhari)}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-semibold tracking-tight text-white">UPI Stream</h3>
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">₹{formatAmount(paymentSplit.upi)} net</span>
            </div>
            <div className="space-y-3">
              {upiTransactions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-20 text-center text-[10px] font-black uppercase tracking-[0.26em] text-white/35">
                  No UPI today
                </div>
              ) : upiTransactions.map((t) => <TransactionCard key={t.id} t={t} />)}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-semibold tracking-tight text-white">Ledger History</h3>
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-300">₹{formatAmount(paymentSplit.udhari)} udhari</span>
            </div>
            <div className="space-y-3">
              {udhariTransactions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-20 text-center text-[10px] font-black uppercase tracking-[0.26em] text-white/35">
                  Empty Log
                </div>
              ) : udhariTransactions.map((t) => <TransactionCard key={t.id} t={t} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
