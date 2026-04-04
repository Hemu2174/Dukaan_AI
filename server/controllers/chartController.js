const Transaction = require('../models/Transaction');

const getWeeklyChartData = async (req, res) => {
  try {
    let user_id = req.user.id;

    if (req.user.role === 'helper') {
      user_id = req.user.owner_id;
    }

    // Get last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    // MongoDB Aggregation Pipeline
    const data = await Transaction.aggregate([
      {
        $match: {
          user_id: user_id,
          created_at: { $gte: sevenDaysAgo, $lte: today }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$created_at'
            }
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          income: 1,
          expense: 1,
          profit: { $subtract: ['$income', '$expense'] }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    // Create map of existing data
    const dataMap = {};
    data.forEach(d => {
      dataMap[d.date] = d;
    });

    // Build complete 7-day array with missing days
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      if (dataMap[dateStr]) {
        chartData.push(dataMap[dateStr]);
      } else {
        chartData.push({
          date: dateStr,
          income: 0,
          expense: 0,
          profit: 0
        });
      }
    }

    res.json(chartData);
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};

module.exports = { getWeeklyChartData };
