import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReorderBanner = () => {
  const [alerts, setAlerts] = useState([]);
  
  const fetchReorderAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/products/reorder-alerts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      if (res.ok && data.length > 0) {
        setAlerts(data);
      }
    } catch (err) {
      console.error("Reorder alert check failed", err);
    }
  };

  useEffect(() => {
    fetchReorderAlerts();
  }, []);

  const handleResolve = (id) => {
    // Optimistic UI hide resolving MVP workflow
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="mt-4 sm:mt-6 space-y-4 animate-fade-in-down pb-2">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-card border border-border rounded-2xl shadow-xl p-6 relative overflow-hidden group hover:border-money-neg/20 transition-all">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-money-neg/40 group-hover:bg-money-neg transition-colors" />
          
          <div className="absolute top-0 right-0 bg-money-neg/10 text-money-neg text-[9px] font-black px-4 py-2 rounded-bl-xl uppercase tracking-widest border-l border-b border-border">
            Critical Reorder
          </div>
          
          <div className="flex gap-6">
            <div className="min-w-[64px] h-16 rounded-xl bg-section flex items-center justify-center text-3xl border border-border">
              📦
            </div>
            
            <div className="flex-1">
              <h4 className="font-heading font-medium text-text-primary text-xl sm:text-2xl mb-2 flex flex-wrap items-center gap-3 italic">
                {alert.product_name} 
                <span className="font-bold text-money-neg bg-money-neg/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border border-money-neg/10">
                  {alert.days_remaining} Days Left
                </span>
              </h4>
              
              <p className="text-text-secondary text-sm sm:text-base mb-6 font-sans font-light leading-relaxed">
                {alert.alert_message}
              </p>
              
              <div className="flex items-center gap-3">
                <a 
                  href={`tel:${alert.phone || '9876543210'}`} 
                  className="flex-1 flex gap-3 items-center justify-center bg-neon text-dark py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all active:scale-95 shadow-xl hover:bg-white"
                >
                   Call Stockist
                </a>
                
                <button 
                  onClick={() => handleResolve(alert.id)}
                  className="w-12 h-12 border border-border text-label rounded-xl flex items-center justify-center bg-dark hover:text-text-primary transition-all shadow-sm"
                  title="Mark Resolved"
                >
                  ✖
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>


  );
};

export default ReorderBanner;
