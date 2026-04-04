import { useState, useEffect } from 'react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen w-full bg-dark pb-32">
      <div className="px-6 py-6 border-b border-border bg-section mb-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-neon rounded-full shadow-[0_0_10px_rgba(163,255,18,0.5)]"></div>
             <h1 className="text-2xl font-heading font-medium text-text-primary tracking-tight italic">
              సూచనలు <span className="text-sm font-normal text-label not-italic uppercase tracking-widest ml-2">(Alerts)</span>
            </h1>
          </div>
        </div>
      </div>
      
      <div className="px-6">
        {alerts.length === 0 ? (
          <div className="bg-card p-12 rounded-[2rem] border border-border border-dashed text-center flex flex-col items-center justify-center h-80 shadow-2xl relative overflow-hidden group hover:border-neon/30 transition-all">
              <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-5xl mb-6 opacity-20 grayscale">📭</span>
              <p className="text-text-secondary text-sm font-heading italic tracking-wide">Infrastructure reports all clear.</p>
              <p className="text-[10px] text-label uppercase font-black tracking-widest mt-6 opacity-50">No critical anomalies detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(a => (
              <div key={a.id} className="bg-card border border-border rounded-2xl p-6 shadow-xl relative group hover:border-neon/30 transition-all">
                <button 
                  onClick={() => handleDismiss(a.id)}
                  className="absolute top-6 right-6 text-label hover:text-red-400 transition-all bg-dark rounded-full w-8 h-8 flex items-center justify-center border border-border group-hover:border-neon/20 shadow-sm"
                >
                  ✖
                </button>
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-money-neg animate-pulse"></div>
                   <span className="text-[10px] uppercase font-black tracking-widest text-label">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-text-primary text-base font-sans font-light leading-relaxed pr-10 opacity-90">{a.alert_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
