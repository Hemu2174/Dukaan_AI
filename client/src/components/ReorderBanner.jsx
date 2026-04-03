import { useState, useEffect } from 'react';

const ReorderBanner = () => {
  const [alerts, setAlerts] = useState([]);
  
  const fetchReorderAlerts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products/reorder-alerts', {
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
    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 animate-fade-in-down">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-red-50 border-2 border-red-200 rounded-xl shadow-md p-4 sm:p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-widest hidden md:block">
            Urgent Reorder
          </div>
          
          <div className="flex gap-3">
            <span className="text-3xl mt-1 animate-pulse">📦</span>
            
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-sm sm:text-base mb-1 flex flex-wrap items-center gap-2">
                {alert.product_name} 
                <span className="font-black text-red-600 bg-red-100 px-2 py-0.5 rounded text-xs">{alert.days_remaining} Days Left</span>
              </h4>
              
              <p className="text-red-800 text-xs sm:text-sm mb-3 font-medium leading-relaxed bg-white/50 p-2 sm:p-3 rounded-lg border border-red-100">
                {alert.alert_message}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <a 
                  href={`tel:${alert.phone || '9876543210'}`} 
                  className="flex-1 flex gap-2 items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors active:scale-95"
                >
                  <span className="text-lg">📞</span> 
                  Call {alert.distributor_name}
                </a>
                
                <button 
                  onClick={() => handleResolve(alert.id)}
                  className="w-10 sm:w-12 h-10 sm:h-12 border border-red-300 text-red-700 rounded-lg flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all text-xs sm:text-sm font-bold"
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
