import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_URL}/alerts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (res.ok) setAlerts(data);
      } catch (err) {
        console.error('Alerts fetching error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleDismiss = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id));
    const dismissedAlerts = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]');
    dismissedAlerts.push(id);
    localStorage.setItem('dismissed_alerts', JSON.stringify(dismissedAlerts));
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0F1A] px-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <p className="text-sm text-white/60">లోడ్ అవుతోంది... (Loading...)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F1A] pb-12 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 md:pt-6">
        <div className="mb-10 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl md:px-6 md:py-5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.45)]" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              సూచనలు <span className="ml-2 text-sm font-normal uppercase tracking-[0.28em] text-white/35">(Alerts)</span>
            </h1>
          </div>
        </div>

        <div className="px-4 md:px-6">
          {alerts.length === 0 ? (
            <div className="relative flex h-80 flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-white/10 bg-[#111827] p-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] group hover:border-white/20 transition-all">
              <div className="absolute inset-0 bg-cyan-300/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="mb-6 text-5xl opacity-20 grayscale">📭</span>
              <p className="text-sm font-medium tracking-wide text-white/70">Infrastructure reports all clear.</p>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">No critical anomalies detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((a) => (
                <div key={a.id} className="relative rounded-[24px] border border-white/10 bg-[#111827] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-all group hover:border-white/20">
                  <button
                    onClick={() => handleDismiss(a.id)}
                    className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 shadow-sm transition-all hover:text-rose-300"
                  >
                    ✖
                  </button>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-300 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="pr-10 text-base leading-relaxed text-white/80">{a.alert_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
