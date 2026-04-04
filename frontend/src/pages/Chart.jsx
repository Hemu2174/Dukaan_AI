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

const demoChartData = [
  { date: 'Mar 20', income: 2500, expense: 800, profit: 1700 },
  { date: 'Mar 21', income: 3200, expense: 1200, profit: 2000 },
  { date: 'Mar 22', income: 1800, expense: 900, profit: 900 },
  { date: 'Mar 23', income: 4000, expense: 1500, profit: 2500 },
  { date: 'Mar 24', income: 2200, expense: 1000, profit: 1200 },
  { date: 'Mar 25', income: 5000, expense: 2000, profit: 3000 },
  { date: 'Mar 26', income: 1500, expense: 700, profit: 800 }
];

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

      const safeApiData = Array.isArray(data)
        ? data.map((day) => ({
            date: day.date,
            income: Number(day.income || 0),
            expense: Number(day.expense || 0),
            profit: Number(day.profit || 0)
          }))
        : [];

      const totalsData = safeApiData.reduce(
        (acc, day) => ({
          totalIncome: acc.totalIncome + (day.income || 0),
          totalExpense: acc.totalExpense + (day.expense || 0),
          totalProfit: acc.totalProfit + (day.profit || 0)
        }),
        { totalIncome: 0, totalExpense: 0, totalProfit: 0 }
      );

      setChartData(safeApiData);
      setTotals(totalsData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const safeChartData =
    Array.isArray(chartData) && chartData.length >= 3
      ? chartData
      : demoChartData;

  const getTrendInsight = () => {
    if (!safeChartData.length) return null;

    const safeTotals = safeChartData.reduce(
      (acc, day) => ({
        totalIncome: acc.totalIncome + Number(day.income || 0),
        totalExpense: acc.totalExpense + Number(day.expense || 0),
        totalProfit: acc.totalProfit + Number(day.profit || 0)
      }),
      { totalIncome: 0, totalExpense: 0, totalProfit: 0 }
    );

    if (safeTotals.totalProfit > 0) {
      return '✅ This week ended in profit';
    } else if (safeTotals.totalProfit < 0) {
      return '⚠️ This week ended in loss';
    }

    const highExpenseDays = safeChartData.filter(d => d.expense > d.income).length;
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

  const transformedData = safeChartData.map((d) => ({
    ...d,
    date: d.date && d.date.includes('-') ? formatDate(d.date) : d.date,
    income: Number(d.income || 0),
    expense: Number(d.expense || 0),
    profit: Number(d.profit || 0)
  }));

  const safeTotals = transformedData.reduce(
    (acc, day) => ({
      totalIncome: acc.totalIncome + day.income,
      totalExpense: acc.totalExpense + day.expense,
      totalProfit: acc.totalProfit + day.profit
    }),
    { totalIncome: 0, totalExpense: 0, totalProfit: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon mx-auto mb-4"></div>
          <p className="text-text-primary">లోడ్ అవుతోంది... (Loading...)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-dark pb-32">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border bg-section mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
            <h1 className="text-2xl font-heading font-medium text-text-primary tracking-tight italic">
              వారపు చార్ట్ <span className="text-sm font-normal text-label not-italic uppercase tracking-widest ml-2">(Weekly Chart)</span>
            </h1>
          </div>
        </div>

        <div className="px-6">
          {error ? (
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={fetchChartData}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
              >
                Retry
              </button>
            </div>
          ) : null}

          <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {/* Income Card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:border-neon/30 transition-all">
                  <div className="text-[9px] uppercase font-black tracking-widest text-label mb-2">
                    ఆదాయం
                  </div>
                  <div className="text-lg font-heading font-bold text-blue-400">
                    {formatCurrency(safeTotals.totalIncome)}
                  </div>
                  <div className="text-[8px] text-label mt-1">Income</div>
                </div>

                {/* Expense Card */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:border-neon/30 transition-all">
                  <div className="text-[9px] uppercase font-black tracking-widest text-label mb-2">
                    ఖర్చులు
                  </div>
                  <div className="text-lg font-heading font-bold text-money-neg">
                    {formatCurrency(safeTotals.totalExpense)}
                  </div>
                  <div className="text-[8px] text-label mt-1">Expense</div>
                </div>

                {/* Profit Card */}
                <div className={`bg-card border rounded-2xl p-4 shadow-lg transition-all ${
                  safeTotals.totalProfit >= 0
                    ? 'border-blue-400 hover:border-blue-400/50'
                    : 'border-money-neg hover:border-money-neg/50'
                }`}>
                  <div className="text-[9px] uppercase font-black tracking-widest text-label mb-2">
                    లాభం
                  </div>
                  <div className={`text-lg font-heading font-bold ${
                    safeTotals.totalProfit >= 0 ? 'text-blue-400' : 'text-money-neg'
                  }`}>
                    {formatCurrency(safeTotals.totalProfit)}
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
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(96,165,250,0.1)" />
                    <XAxis
                      dataKey="date"
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
                    <Bar dataKey="income" fill="#3b82f6" radius={[6, 6, 0, 0]} />
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
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(96,165,250,0.1)" />
                    <XAxis
                      dataKey="date"
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
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Trend Insight */}
              <div className="bg-section border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-6 bg-blue-400 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-text-primary font-heading font-medium">
                      {getTrendInsight()}
                    </p>
                  </div>
                </div>
              </div>
            </>
        </div>
      </div>
  );
};

export default Chart;
