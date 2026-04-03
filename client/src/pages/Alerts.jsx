import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Test Supabase Function (Fix as requested)
  const testInsert = async () => {
    // Requires a valid user_id or a bypass if RLS allows. 
    // Since RLS is enabled, we need to pass the real user ID or a valid UUID to avoid syntax errors.
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: "00000000-0000-0000-0000-000000000000", // valid uuid stub
          amount: 100,
          type: "income"
        }
      ]);

    console.log("Insert Response:", data, error);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Success! Check Supabase / console.");
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/alerts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setAlerts(data);
      } catch (err) {
        console.error("Alerts fetching error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleDismiss = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
    // Optional: make a DELETE API call if you want DB level dismiss, but req was localStorage
    const dismissedAlerts = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
    dismissedAlerts.push(id);
    localStorage.setItem('dismissed_alerts', JSON.stringify(dismissedAlerts));
  };

  if (loading) return <div className="p-6 text-center text-gray-500">లోడ్ అవుతోంది... (Loading...)</div>;

  return (
    <div className="px-3 py-2 h-full pb-24 w-full bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">సూచనలు <br/><span className="text-sm font-normal text-gray-500">(Alerts History)</span></h1>
        <button onClick={testInsert} className="bg-blue-600 text-white px-3 py-1 text-sm rounded shadow-sm hover:bg-blue-700">Test Insert</button>
      </div>
      
      {alerts.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <span className="text-4xl mb-3 opacity-50 block">📭</span>
            <p className="text-gray-500 text-sm">ఎలాంటి సూచనలూ లేవు (No alerts available yet)</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(a => (
            <div key={a.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm relative">
              <button 
                onClick={() => handleDismiss(a.id)}
                className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-900 transition-colors bg-white/50 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✖
              </button>
              <div className="flex items-center gap-2 mb-2 text-yellow-800 text-xs font-semibold">
                <span>⚠️</span>
                <span>{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-yellow-900 text-sm leading-relaxed pr-6">{a.alert_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
