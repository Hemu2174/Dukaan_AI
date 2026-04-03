import { useState, useEffect } from 'react';
import AlertBanner from '../components/AlertBanner';
import ReorderBanner from '../components/ReorderBanner';

const TransactionCard = ({ t }) => {
  const isIncome = t.type === "income";

  return (
    <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border mb-3 hover:border-neon/30 transition-all duration-300 shadow-sm">
      <div>
        <p className="text-text-primary text-base font-medium font-heading tracking-wide italic">{t.category || "General"}</p>
        <p className="text-label text-[10px] uppercase font-bold tracking-widest">{t.payment_method}</p>
      </div>

      <div
        className={`font-semibold text-lg tracking-tight ${
          isIncome ? "text-money-pos" : "text-money-neg"
        }`}
      >
        {isIncome ? "+" : "-"}₹{t.amount}
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
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [txRes, splRes] = await Promise.all([
        fetch('/api/transactions/today', { headers }),
        fetch('/api/payments/split', { headers })
      ]);
      
      if (txRes.ok) setTransactions(await txRes.json());
      if (splRes.ok) setSplits(await splRes.json());
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

  if (loading) return <div className="p-10 text-center text-text-secondary animate-pulse italic font-heading">Analyzing activity...</div>;

  return (
    <div className="min-h-screen w-full bg-dark pb-32">
      <ReorderBanner />
      <AlertBanner />
      
      <div className="px-6 py-6 border-b border-border bg-section mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-neon rounded-full shadow-[0_0_10px_rgba(163,255,18,0.5)]"></div>
             <h1 className="text-2xl font-heading font-medium text-text-primary tracking-tight italic">Daily Activity</h1>
          </div>
          <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center bg-card rounded-xl border border-border active:scale-95 transition-all hover:border-neon/30" title="Refresh">
            <span className="text-lg">🔄</span>
          </button>
        </div>
      </div>

      <div className="px-6">
      {/* Payment Split Dashboard */}
      <div className="grid grid-cols-3 gap-3 mb-10 w-full">
        <div className="bg-card rounded-xl p-4 border border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-neon/30 transition-all shadow-sm">
          <span className="text-[10px] uppercase font-bold text-neon mb-3 tracking-widest">Cash</span>
          <div className="flex flex-col items-center">
            <div className="flex gap-2 mb-2">
              <span className="text-[10px] text-money-pos font-bold">+{splits.cash.income}</span>
              <span className="text-[10px] text-money-neg font-bold">-{splits.cash.expense}</span>
            </div>
            <div className="h-[1px] w-8 bg-border my-1"></div>
            <span className="text-xl font-heading font-bold text-text-primary tracking-tight italic">₹{splits.cash.net}</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-neon/30 transition-all shadow-sm">
          <span className="text-[10px] uppercase font-bold text-neon mb-3 tracking-widest">Digital</span>
          <div className="flex flex-col items-center">
            <div className="flex gap-2 mb-2">
              <span className="text-[10px] text-money-pos font-bold">+{splits.upi.income}</span>
              <span className="text-[10px] text-money-neg font-bold">-{splits.upi.expense}</span>
            </div>
            <div className="h-[1px] w-8 bg-border my-1"></div>
            <span className="text-xl font-heading font-bold text-text-primary tracking-tight italic">₹{splits.upi.net}</span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-neon/30 transition-all shadow-sm">
          <span className="text-[10px] uppercase font-bold text-money-neg mb-3 tracking-widest opacity-80">Udhari</span>
          <div className="flex flex-col items-center justify-center pt-1">
            <span className="text-xl font-heading font-bold text-text-primary tracking-tight italic">₹{splits.udhari}</span>
            <span className="text-[8px] text-label uppercase tracking-widest font-bold mt-1">Pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
        
        {/* UPI SECTION */}
        <div className="pt-6 md:pt-0">
          <h3 className="font-heading font-medium text-text-primary mb-6 text-xl italic flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-neon"></span>
            UPI Real-time
          </h3>
          <div className="space-y-1">
            {upiTransactions.length === 0 ? (
              <div className="text-label text-xs italic p-12 bg-card rounded-2xl border border-dashed border-border text-center">
                Quiet day on UPI
              </div>
            ) : (
              upiTransactions.map((t) => (
                <TransactionCard key={t.id} t={t} />
              ))
            )}
          </div>
        </div>

        {/* UDHARI SECTION */}
        <div className="pt-10 md:pt-0 md:pl-8">
          <h3 className="font-heading font-medium text-text-primary mb-6 text-xl italic flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-money-neg"></span>
            Udhari & Cash
          </h3>
          <div className="space-y-1">
            {udhariTransactions.length === 0 ? (
              <div className="text-label text-xs italic p-12 bg-card rounded-2xl border border-dashed border-border text-center">
                No cash/credit logs
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
