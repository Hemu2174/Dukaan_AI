import { useState, useEffect } from 'react';
import AlertBanner from '../components/AlertBanner';
import ReorderBanner from '../components/ReorderBanner';

const TransactionCard = ({ t }) => {
  const isIncome = t.type === "income";

  return (
    <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-50 mb-2 hover:shadow-md transition-shadow">
      <div>
        <p className="font-semibold text-gray-800 text-sm">{t.category || "General"}</p>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t.payment_method}</p>
      </div>

      <div
        className={`font-bold tracking-tight text-sm ${
          isIncome ? "text-green-600" : "text-red-500"
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
        fetch('http://localhost:5000/api/transactions/today', { headers }),
        fetch('http://localhost:5000/api/payments/split', { headers })
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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-24">
      <ReorderBanner />
      <AlertBanner />
      
      <div className="px-3 py-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Today's Summary</h1>
          <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-90 transition-transform hover:shadow-md border border-gray-100" title="Refresh">
            <span className="text-lg">🔄</span>
          </button>
        </div>
      
      {/* Payment Split Dashboard */}
      <div className="grid grid-cols-3 gap-2 mb-6 w-full">
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-green-700 mb-1 z-10">Cash</span>
          <div className="flex flex-col items-center z-10">
            <span className="text-[10px] text-green-600 font-bold">+{splits.cash.income}</span>
            <span className="text-[10px] text-red-500 font-bold">-{splits.cash.expense}</span>
            <div className="h-[1px] w-8 bg-gray-100 my-0.5"></div>
            <span className="text-sm font-bold text-gray-900">₹{splits.cash.net}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-blue-700 mb-1 z-10">UPI</span>
          <div className="flex flex-col items-center z-10">
            <span className="text-[10px] text-green-600 font-bold">+{splits.upi.income}</span>
            <span className="text-[10px] text-red-500 font-bold">-{splits.upi.expense}</span>
            <div className="h-[1px] w-8 bg-gray-100 my-0.5"></div>
            <span className="text-sm font-bold text-gray-900">₹{splits.upi.net}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-orange-700 mb-1 z-10">Udhari</span>
          <div className="flex flex-col items-center justify-center h-full z-10">
            <span className="text-sm font-bold text-gray-900">₹{splits.udhari}</span>
            <span className="text-[10px] text-gray-400 mt-1">Pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        
        {/* UPI SECTION */}
        <div className="bg-blue-50/30 p-2 rounded-xl">
          <h3 className="font-bold text-blue-600 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            UPI Activity
          </h3>
          {upiTransactions.length === 0 ? (
            <p className="text-gray-400 text-xs italic p-4 bg-white/50 rounded-lg border border-dashed border-gray-200 text-center">No UPI activity today</p>
          ) : (
            upiTransactions.map((t) => (
              <TransactionCard key={t.id} t={t} />
            ))
          )}
        </div>

        {/* UDHARI SECTION */}
        <div className="bg-orange-50/30 p-2 rounded-xl">
          <h3 className="font-bold text-orange-600 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Udhari Activity
          </h3>
          {udhariTransactions.length === 0 ? (
            <p className="text-gray-400 text-xs italic p-4 bg-white/50 rounded-lg border border-dashed border-gray-200 text-center">No Udhari activity today</p>
          ) : (
            udhariTransactions.map((t) => (
              <TransactionCard key={t.id} t={t} />
            ))
          )}
        </div>

      </div>
      </div>
    </div>
  );
};

export default Dashboard;
