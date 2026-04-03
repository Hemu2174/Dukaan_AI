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
    <div className="bg-yellow-100 border border-yellow-300 mt-4 sm:mt-6 rounded-xl shadow-sm p-4 sm:p-5 relative animate-fade-in-up">
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">⚠️</span>
        <div className="flex-1">
          <h4 className="font-bold text-yellow-900 text-sm sm:text-base mb-1">వ్యాపార సూచన (Business Alert)</h4>
          <p className="text-yellow-800 text-sm sm:text-base leading-relaxed">
            {alertData.alert_text}
          </p>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-yellow-600 hover:text-yellow-900 bg-yellow-200/50 hover:bg-yellow-200 p-1 rounded-full transition-colors"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;
