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

  if (loading) return <div className="p-6 text-center text-gray-500">చార్ట్ లోడ్ అవుతోంది... (Loading...)</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const daysWithData = data.filter(d => d.income > 0 || d.expenses > 0).length;
  
  if (daysWithData < 3) {
    return (
      <div className="px-3 py-2 h-full flex flex-col items-center justify-center w-full bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-4 self-start">వారపు లాభాలు <br/><span className="text-sm font-normal text-gray-500">(Weekly Chart)</span></h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center h-64 w-full">
            <span className="text-4xl mb-3 opacity-50">📊</span>
            <p className="text-gray-500 text-sm">కొన్ని రోజులు డేటా చేరిన తర్వాత చార్ట్ కనిపిస్తుంది</p>
            <p className="text-xs text-gray-400 mt-2">(Need at least 3 days of data)</p>
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
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-xs">
          <p className="font-bold text-gray-800 mb-1">{label} వారం ({payload[0].payload.date})</p>
          <p className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
            {isProfit ? 'లాభం (Profit):' : 'నష్టం (Loss):'} ₹{Math.abs(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-3 py-2 h-full pb-24 w-full bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">వారపు లాభాలు <br/><span className="text-sm font-normal text-gray-500">(Weekly Chart)</span></h1>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 mb-6 text-center">
          <span className="text-2xl mb-1 block">🏆</span>
          <p className="text-gray-800 font-medium">Best Day: <span className="font-bold text-primary">{bestDay.dayLabel}</span></p>
          <p className="text-sm text-gray-500 mt-1">Net Profit: <span className="font-bold text-green-600">₹{bestDay.net}</span></p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <div style={{ minWidth: '300px', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, className: "font-semibold text-gray-600" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar 
                        dataKey="net" 
                        radius={[4, 4, 4, 4]}
                        shape={(props) => {
                            const { x, y, width, height, payload } = props;
                            // Recharts passes negative heights weirdly sometimes if axis isn't standardized, 
                            // but generally fill resolves based on the payload value properly.
                            const color = payload.net >= 0 ? "#22c55e" : "#ef4444";
                            // Handle cases where the shape goes below zero axis
                            const isNegative = payload.net < 0;
                            const h = Math.abs(height);
                            // Adjusting y slightly for negative bars natively handled by base Bar, 
                            // passing standard rect here relying on recharts geometry:
                            return <rect x={x} y={y} width={width} height={h} fill={color} rx={4} ry={4} />;
                        }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Chart;
