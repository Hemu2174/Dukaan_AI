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
  const [splits, setSplits] = useState({ cash: 0, upi: 0, udhari: 0 });
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
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-xs font-semibold text-green-700 mb-1 z-10">Cash</span>
          <span className="text-sm font-bold text-gray-900 z-10">₹{splits.cash}</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-xs font-semibold text-blue-700 mb-1 z-10">UPI</span>
          <span className="text-sm font-bold text-gray-900 z-10">₹{splits.upi}</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-xs font-semibold text-orange-700 mb-1 z-10">Udhari</span>
          <span className="text-sm font-bold text-gray-900 z-10">₹{splits.udhari}</span>
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
