const demoTransactions = [
  { amount: 2500, type: 'income', category: 'sales', payment_method: 'cash', createdAt: new Date('2026-03-20T10:00:00Z') },
  { amount: 800, type: 'expense', category: 'vegetables', payment_method: 'cash', createdAt: new Date('2026-03-20T14:00:00Z') },

  { amount: 3200, type: 'income', category: 'sales', payment_method: 'upi', createdAt: new Date('2026-03-21T11:00:00Z') },
  { amount: 1200, type: 'expense', category: 'groceries', payment_method: 'cash', createdAt: new Date('2026-03-21T16:00:00Z') },

  { amount: 1800, type: 'income', category: 'sales', payment_method: 'cash', createdAt: new Date('2026-03-22T12:00:00Z') },
  { amount: 900, type: 'expense', category: 'snacks', payment_method: 'cash', createdAt: new Date('2026-03-22T17:00:00Z') },

  { amount: 4000, type: 'income', category: 'sales', payment_method: 'upi', createdAt: new Date('2026-03-23T13:00:00Z') },
  { amount: 1500, type: 'expense', category: 'rice', payment_method: 'cash', createdAt: new Date('2026-03-23T18:00:00Z') },

  { amount: 2200, type: 'income', category: 'sales', payment_method: 'cash', createdAt: new Date('2026-03-24T10:30:00Z') },
  { amount: 1000, type: 'expense', category: 'milk', payment_method: 'cash', createdAt: new Date('2026-03-24T15:30:00Z') },
];

function getDemoTransactions(ownerId = 'demo-owner') {
  return demoTransactions.map((t, index) => ({
    id: `demo-${index + 1}`,
    user_id: ownerId,
    amount: t.amount,
    type: t.type,
    category: t.category,
    payment_method: t.payment_method,
    createdAt: t.createdAt,
    created_at: t.createdAt,
  }));
}

module.exports = { demoTransactions, getDemoTransactions };