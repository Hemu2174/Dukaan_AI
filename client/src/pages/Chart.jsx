import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const daysTelugu = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];

const Chart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/transactions/week', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const json = await res.json();
        if (res.ok) {
          const formatted = json.map((d) => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              dayLabel: daysTelugu[dateObj.getDay()],
            };
          });
          setData(formatted);
        } else {
          setError(json.error);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch week data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0F1A] px-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <p className="animate-pulse text-sm text-white/60">Analyzing week...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="m-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-10 text-center text-rose-300">{error}</div>;
  }

  const daysWithData = data.filter((d) => d.income > 0 || d.expenses > 0).length;

  if (daysWithData < 3) {
    return (
      <div className="min-h-screen w-full bg-[#0B0F1A] pb-12 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 md:pt-6">
          <div className="mb-10 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl md:px-6 md:py-5">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.45)]" />
              <h1 className="text-2xl font-semibold tracking-tight text-white">వారపు లాభాలు <span className="ml-2 text-sm font-normal uppercase tracking-[0.28em] text-white/35">(Analytics)</span></h1>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6">
          <div className="flex h-80 w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-[#111827] p-12 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <span className="mb-6 text-5xl opacity-20 grayscale">📊</span>
            <p className="text-sm font-medium tracking-wide text-white/70">Historical data synthesis requires at least 3 active days.</p>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Continue logging transactions to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  const bestDay = data.reduce((max, d) => (d.net > max.net ? d : max), data[0]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isProfit = payload[0].value >= 0;
      return (
        <div className="min-w-[150px] rounded-xl border border-white/10 bg-[#0B0F1A] p-4 text-xs shadow-2xl">
          <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-white/40">{label} Analysis</p>
          <p className={`text-xl italic ${isProfit ? 'text-emerald-300' : 'text-rose-300'}`}>
            {isProfit ? '+₹' : '-₹'}{Math.abs(payload[0].value)}
          </p>
          <p className="mt-1 text-[8px] uppercase tracking-tighter text-white/35">Net Cumulative Yield</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F1A] pb-12 text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 md:pt-6">
        <div className="mb-10 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl md:px-6 md:py-5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.45)]" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">వారపు లాభాలు <span className="ml-2 text-sm font-normal uppercase tracking-[0.28em] text-white/35">(Yields)</span></h1>
          </div>
        </div>

        <div className="px-4 md:px-6">
          <div className="relative mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#111827] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] group">
            <div className="absolute inset-0 bg-cyan-300/10 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="mb-3 block text-3xl">🏆</span>
            <p className="text-xl font-semibold text-white">Operational Peak: <span className="font-bold text-cyan-300">{bestDay.dayLabel}</span></p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Maximum Net Gain: <span className="text-emerald-300">₹{bestDay.net}</span></p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111827] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div style={{ minWidth: '300px', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(163,255,18,0.03)' }} />
                  <Bar
                    dataKey="net"
                    radius={[6, 6, 6, 6]}
                    shape={(props) => {
                      const { x, y, width, height, payload } = props;
                      const color = payload.net >= 0 ? 'var(--money-pos)' : 'var(--money-neg)';
                      const h = Math.abs(height);
                      return (
                        <g>
                          <rect x={x} y={y} width={width} height={h} fill={color} rx={8} ry={8} className="transition-all duration-500" />
                          {payload.net >= 0 && <rect x={x} y={y} width={width} height={h} fill="url(#neonGradient)" opacity={0.1} rx={8} ry={8} />}
                        </g>
                      );
                    }}
                  />
                  <defs>
                    <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22FF88" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#22FF88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart;
