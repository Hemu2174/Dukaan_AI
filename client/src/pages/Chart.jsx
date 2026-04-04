import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { getWeeklyChartData } from '../services/chartApi';
import Layout from '../components/Layout';

const Chart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalProfit: 0
  });

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeeklyChartData();

      if (!data || data.length === 0) {
        setChartData([]);
        setTotals({
          totalIncome: 0,
          totalExpense: 0,
          totalProfit: 0
        });
        return;
      }

      // Calculate totals
      const totalsData = data.reduce(
        (acc, day) => ({
          totalIncome: acc.totalIncome + (day.income || 0),
          totalExpense: acc.totalExpense + (day.expense || 0),
          totalProfit: acc.totalProfit + (day.profit || 0)
        }),
        { totalIncome: 0, totalExpense: 0, totalProfit: 0 }
      );

      setChartData(data);
      setTotals(totalsData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTrendInsight = () => {
    if (chartData.length === 0) return null;

    if (totals.totalProfit > 0) {
      return '✅ This week ended in profit';
    } else if (totals.totalProfit < 0) {
      return '⚠️ This week ended in loss';
    }

    const highExpenseDays = chartData.filter(d => d.expense > d.income).length;
    if (highExpenseDays >= 3) {
      return '📊 Expenses were high on multiple days';
    }

    return 'Balanced week';
  };

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Transform data for better chart display
  const transformedData = chartData.map(d => ({
    ...d,
    displayDate: formatDate(d.date)
  }));

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen w-full bg-dark flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon mx-auto mb-4"></div>
            <p className="text-text-primary">లోడ్ అవుతోంది... (Loading...)</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen w-full bg-dark pb-32">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border bg-section mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-neon rounded-full shadow-[0_0_10px_rgba(163,255,18,0.5)]"></div>
            <h1 className="text-2xl font-heading font-medium text-text-primary tracking-tight italic">
              వారపు చార్ట్ <span className="text-sm font-normal text-label not-italic uppercase tracking-widest ml-2">(Weekly Chart)</span>
            </h1>
          </div>
        </div>

        <div className="px-6">
          {error ? (
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 mb-8">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={fetchChartData}
                className="mt-4 px-4 py-2 bg-neon text-dark rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
              >
                Retry
              </button>
            </div>
          ) : null}

          {chartData.length === 0 ? (
            <div className="bg-card p-12 rounded-[2rem] border border-border border-dashed text-center flex flex-col items-center justify-center h-80 shadow-2xl relative overflow-hidden group hover:border-neon/30 transition-all">
              <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-5xl mb-6 opacity-20">📊</span>
              <p className="text-text-secondary text-sm font-heading italic tracking-wide">
                చార్ట్ డేటా ఇంకా లేదు
              </p>
              <p className="text-text-secondary text-sm font-heading italic tracking-wide mt-2">
                (No chart data available yet)
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {/* Income Card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:border-neon/30 transition-all">
                  <div className="text-[9px] uppercase font-black tracking-widest text-label mb-2">
                    ఆదాయం
                  </div>
                  <div className="text-lg font-heading font-bold text-money-pos">
                    {formatCurrency(totals.totalIncome)}
                  </div>
                  <div className="text-[8px] text-label mt-1">Income</div>
                </div>

                {/* Expense Card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:border-neon/30 transition-all">
                  <div className="text-[9px] uppercase font-black tracking-widest text-label mb-2">
                    ఖర్చులు
                  </div>
                  <div className="text-lg font-heading font-bold text-money-neg">
                    {formatCurrency(totals.totalExpense)}
                  </div>
                  <div className="text-[8px] text-label mt-1">Expense</div>
                </div>

                {/* Profit Card */}
                <div className={`bg-card border rounded-2xl p-4 shadow-lg transition-all ${
                  totals.totalProfit >= 0
                    ? 'border-money-pos hover:border-money-pos/50'
                    : 'border-money-neg hover:border-money-neg/50'
                }`}>
                  <div className="text-[9px] uppercase font-black tracking-widest text-label mb-2">
                    లాభం
                  </div>
                  <div className={`text-lg font-heading font-bold ${
                    totals.totalProfit >= 0 ? 'text-money-pos' : 'text-money-neg'
                  }`}>
                    {formatCurrency(totals.totalProfit)}
                  </div>
                  <div className="text-[8px] text-label mt-1">Profit</div>
                </div>
              </div>

              {/* Bar Chart - Income vs Expense */}
              <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-xl">
                <h3 className="text-sm font-heading font-bold text-text-primary mb-4 uppercase tracking-widest">
                  ఆదాయ vs ఖర్చు
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={transformedData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,255,18,0.1)" />
                    <XAxis
                      dataKey="displayDate"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(163,255,18,0.3)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart - Profit Trend */}
              <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-xl">
                <h3 className="text-sm font-heading font-bold text-text-primary mb-4 uppercase tracking-widest">
                  లాభ ట్రెండ్
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={transformedData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,255,18,0.1)" />
                    <XAxis
                      dataKey="displayDate"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(163,255,18,0.3)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#a3ff12"
                      strokeWidth={2}
                      dot={{ fill: '#a3ff12', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Trend Insight */}
              <div className="bg-section border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-6 bg-neon rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-text-primary font-heading font-medium">
                      {getTrendInsight()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chart;
