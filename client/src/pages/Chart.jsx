import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const daysTelugu = ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"];

const Chart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/transactions/week', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await res.json();
        if (res.ok) {
          // Format data for chart
          const formatted = json.map(d => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              dayLabel: daysTelugu[dateObj.getDay()]
            };
          });
          setData(formatted);
        } else {
          setError(json.error);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch week data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeekData();
  }, []);

  if (loading) return <div className="p-10 text-center text-label animate-pulse font-heading lowercase tracking-widest italic h-screen bg-dark w-full">Analyzing week...</div>;
  if (error) return <div className="p-10 text-center text-money-neg bg-money-neg/10 m-6 rounded-xl border border-money-neg/20">{error}</div>;

  const daysWithData = data.filter(d => d.income > 0 || d.expenses > 0).length;
  
  if (daysWithData < 3) {
    return (
      <div className="min-h-screen w-full bg-dark pb-32">
        <div className="px-6 py-6 border-b border-border bg-section mb-10">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-neon rounded-full"></div>
             <h1 className="text-2xl font-heading font-medium text-text-primary tracking-tight italic">వారపు లాభాలు <span className="text-sm font-normal text-label not-italic uppercase tracking-widest ml-2">(Analytics)</span></h1>
          </div>
        </div>
        <div className="px-6">
          <div className="bg-card p-12 rounded-[2.5rem] border border-border border-dashed text-center flex flex-col items-center justify-center h-80 w-full shadow-xl">
              <span className="text-5xl mb-6 opacity-20 grayscale">📊</span>
              <p className="text-label text-sm font-medium tracking-wide">Historical data synthesis requires at least 3 active days.</p>
              <p className="text-[10px] text-label/50 uppercase font-black tracking-widest mt-6">Continue logging transactions to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  // Find best day
  const bestDay = data.reduce((max, d) => (d.net > max.net ? d : max), data[0]);

  // Tooltip custom formatter Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isProfit = payload[0].value >= 0;
      return (
        <div className="bg-dark p-4 rounded-xl shadow-2xl border border-border text-xs min-w-[150px]">
          <p className="font-black text-text-primary/40 mb-2 uppercase tracking-widest text-[8px]">{label} Analysis</p>
          <p className={`font-heading text-xl italic ${isProfit ? 'text-money-pos' : 'text-money-neg'}`}>
            {isProfit ? '+₹' : '-₹'}{Math.abs(payload[0].value)}
          </p>
          <p className="text-[8px] text-label mt-1 uppercase tracking-tighter">Net Cumulative Yield</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-dark pb-32">
      <div className="px-6 py-6 border-b border-border bg-section mb-10">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 bg-neon rounded-full"></div>
           <h1 className="text-2xl font-heading font-medium text-text-primary tracking-tight italic">వారపు లాభాలు <span className="text-sm font-normal text-label not-italic uppercase tracking-widest ml-2">(Yields)</span></h1>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-card p-6 rounded-2xl border border-border mb-8 text-center shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-neon/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-3xl mb-3 block">🏆</span>
            <p className="text-text-primary font-medium italic font-heading text-xl">Operational Peak: <span className="font-bold text-neon">{bestDay.dayLabel}</span></p>
            <p className="text-[10px] text-label uppercase tracking-[0.2em] font-black mt-3">Maximum Net Gain: <span className="text-money-pos">₹{bestDay.net}</span></p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border overflow-hidden shadow-xl">
          <div style={{ minWidth: '300px', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6F6F6F', fontWeight: 900 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6F6F6F' }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(163,255,18,0.03)' }} />
                      <Bar 
                          dataKey="net" 
                          radius={[6, 6, 6, 6]}
                          shape={(props) => {
                              const { x, y, width, height, payload } = props;
                              // Using CSS variables directly in SVG fill works in modern browsers
                              const color = payload.net >= 0 ? "var(--money-pos)" : "var(--money-neg)";
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

  );
};

export default Chart;
