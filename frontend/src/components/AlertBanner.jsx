import { useState, useEffect } from 'react';

const AlertBanner = () => {
  const [alertData, setAlertData] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/alerts/weekly', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        
        if (data.alert) {
          const today = new Date().toISOString().split('T')[0];
          // Check if this particular alert was already dismissed today
          const dismissedAlerts = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
          
          if (!dismissedAlerts.includes(data.alert.id) && !dismissedAlerts.includes(today)) {
            setAlertData(data.alert);
          }
        }
      } catch (err) {
        console.error("Alert check failed", err);
      }
    };
    checkAlerts();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    const today = new Date().toISOString().split('T')[0];
    const dismissedAlerts = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
    dismissedAlerts.push(alertData?.id || today);
    localStorage.setItem('dismissed_alerts', JSON.stringify(dismissedAlerts));
  };

  if (!alertData || dismissed) return null;

  return (
    <div className="bg-card border border-border mt-4 sm:mt-6 rounded-[1.25rem] shadow-xl p-5 sm:p-6 relative animate-fade-in-up overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-neon/20 group-hover:bg-neon transition-colors" />
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-section flex items-center justify-center text-xl border border-border">
          ⚡
        </div>
        <div className="flex-1">
          <h4 className="font-heading font-medium text-text-primary text-lg sm:text-xl mb-1 italic">వ్యాపార సూచన (Business Alert)</h4>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed font-sans font-light">
            {alertData.alert_text}
          </p>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-label hover:text-text-primary bg-dark p-2 rounded-xl border border-border transition-all"
        >
          <span className="text-[10px]">✖</span>
        </button>
      </div>
    </div>


  );
};

export default AlertBanner;
