const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// MongoDB Connection
async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dukaan_ai';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Seed script
async function seedTwoWeeksData() {
  try {
    console.log('🌱 Starting seed process...\n');

    // 1. Clear existing transactions for demo user (optional)
    console.log('📋 Checking for existing demo user...');

    // 2. Create or find demo user
    let demoUser = await User.findOne({ email: 'ramu@dukaanai.com' });
    
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash('demo_password_123', 10);
      demoUser = new User({
        name: 'Ramu',
        phone: '9876543210',
        email: 'ramu@dukaanai.com',
        password: hashedPassword,
        business_name: 'Ramu Kirana Store',
        role: 'owner'
      });
      await demoUser.save();
      console.log('✅ Demo user created:', demoUser._id);
    } else {
      console.log('✅ Demo user found:', demoUser._id);
    }

    // 3. Remove old transactions for this user (clean slate)
    const deletedCount = await Transaction.deleteMany({ user_id: demoUser._id });
    console.log(`🗑️  Removed ${deletedCount.deletedCount} old transactions\n`);

    // 4. Prepare 14 days of realistic transaction data
    const transactionData = [
      // March 20, 2026
      {
        user_id: demoUser._id,
        amount: 1800,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'morning sales',
        created_at: new Date('2026-03-20T09:30:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 900,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'evening sales',
        created_at: new Date('2026-03-20T18:00:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 800,
        type: 'expense',
        category: 'vegetables',
        payment_method: 'cash',
        notes: 'bought vegetables stock',
        created_at: new Date('2026-03-20T14:00:00Z')
      },

      // March 21, 2026
      {
        user_id: demoUser._id,
        amount: 2200,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'daily sales',
        created_at: new Date('2026-03-21T11:00:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1200,
        type: 'expense',
        category: 'groceries',
        payment_method: 'cash',
        notes: 'groceries supplier payment',
        created_at: new Date('2026-03-21T16:00:00Z')
      },

      // March 22, 2026
      {
        user_id: demoUser._id,
        amount: 1100,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'morning sales',
        created_at: new Date('2026-03-22T10:00:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 900,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'evening sales',
        created_at: new Date('2026-03-22T19:00:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 900,
        type: 'expense',
        category: 'snacks',
        payment_method: 'cash',
        notes: 'snacks stock refill',
        created_at: new Date('2026-03-22T15:30:00Z')
      },

      // March 23, 2026
      {
        user_id: demoUser._id,
        amount: 2600,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'daily sales',
        created_at: new Date('2026-03-23T12:30:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1500,
        type: 'expense',
        category: 'rice',
        payment_method: 'cash',
        notes: 'rice stock purchase',
        created_at: new Date('2026-03-23T17:00:00Z')
      },

      // March 24, 2026
      {
        user_id: demoUser._id,
        amount: 1500,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'morning sales',
        created_at: new Date('2026-03-24T09:45:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 900,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'evening sales',
        created_at: new Date('2026-03-24T18:10:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1000,
        type: 'expense',
        category: 'milk',
        payment_method: 'cash',
        notes: 'paid milk supplier',
        created_at: new Date('2026-03-24T14:30:00Z')
      },

      // March 25, 2026
      {
        user_id: demoUser._id,
        amount: 3200,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'daily sales',
        created_at: new Date('2026-03-25T11:30:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 2000,
        type: 'expense',
        category: 'oil',
        payment_method: 'cash',
        notes: 'oil cans supplier payment',
        created_at: new Date('2026-03-25T17:30:00Z')
      },

      // March 26, 2026
      {
        user_id: demoUser._id,
        amount: 900,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'morning sales',
        created_at: new Date('2026-03-26T09:20:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 700,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'evening sales',
        created_at: new Date('2026-03-26T18:40:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 700,
        type: 'expense',
        category: 'vegetables',
        payment_method: 'cash',
        notes: 'vegetable stock purchase',
        created_at: new Date('2026-03-26T13:50:00Z')
      },

      // March 27, 2026
      {
        user_id: demoUser._id,
        amount: 1800,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'morning sales',
        created_at: new Date('2026-03-27T10:10:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1200,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'evening sales',
        created_at: new Date('2026-03-27T19:00:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1200,
        type: 'expense',
        category: 'fruits',
        payment_method: 'cash',
        notes: 'fruit stock refill',
        created_at: new Date('2026-03-27T15:00:00Z')
      },

      // March 28, 2026
      {
        user_id: demoUser._id,
        amount: 2600,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'daily sales',
        created_at: new Date('2026-03-28T11:00:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1800,
        type: 'expense',
        category: 'groceries',
        payment_method: 'cash',
        notes: 'groceries supplier payment',
        created_at: new Date('2026-03-28T16:00:00Z')
      },

      // March 29, 2026
      {
        user_id: demoUser._id,
        amount: 1200,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'morning sales',
        created_at: new Date('2026-03-29T10:20:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 800,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'evening sales',
        created_at: new Date('2026-03-29T18:20:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1500,
        type: 'expense',
        category: 'snacks',
        payment_method: 'cash',
        notes: 'snacks wholesale purchase',
        created_at: new Date('2026-03-29T14:10:00Z')
      },

      // March 30, 2026
      {
        user_id: demoUser._id,
        amount: 2100,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'daily sales',
        created_at: new Date('2026-03-30T12:40:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1300,
        type: 'expense',
        category: 'rice',
        payment_method: 'cash',
        notes: 'rice bag purchase',
        created_at: new Date('2026-03-30T17:45:00Z')
      },

      // March 31, 2026
      {
        user_id: demoUser._id,
        amount: 1600,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'morning sales',
        created_at: new Date('2026-03-31T10:30:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1200,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'evening sales',
        created_at: new Date('2026-03-31T19:10:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 900,
        type: 'expense',
        category: 'milk',
        payment_method: 'cash',
        notes: 'milk supplier payment',
        created_at: new Date('2026-03-31T15:30:00Z')
      },

      // April 1, 2026
      {
        user_id: demoUser._id,
        amount: 3000,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'daily sales',
        created_at: new Date('2026-04-01T11:30:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 1800,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'festival rush evening sales',
        created_at: new Date('2026-04-01T19:15:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 2200,
        type: 'expense',
        category: 'oil',
        payment_method: 'cash',
        notes: 'bulk oil stock purchase',
        created_at: new Date('2026-04-01T16:20:00Z')
      },

      // April 2, 2026
      {
        user_id: demoUser._id,
        amount: 900,
        type: 'income',
        category: 'sales',
        payment_method: 'upi',
        notes: 'morning sales',
        created_at: new Date('2026-04-02T09:50:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 700,
        type: 'income',
        category: 'sales',
        payment_method: 'cash',
        notes: 'evening sales',
        created_at: new Date('2026-04-02T18:05:00Z')
      },
      {
        user_id: demoUser._id,
        amount: 800,
        type: 'expense',
        category: 'vegetables',
        payment_method: 'cash',
        notes: 'fresh vegetables purchase',
        created_at: new Date('2026-04-02T13:40:00Z')
      }
    ];

    // 5. Insert transactions
    console.log('💾 Inserting 36 transactions across 14 days...');
    const result = await Transaction.insertMany(transactionData);
    console.log(`✅ ${result.length} transactions inserted successfully\n`);

    // 6. Calculate and display summary
    const totalIncome = transactionData.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum, 0);
    const totalExpense = transactionData.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
    const profit = totalIncome - totalExpense;

    console.log('📊 Seed Data Summary:');
    console.log(`   Demo User: ${demoUser.name} (${demoUser.email})`);
    console.log(`   Demo User ID: ${demoUser._id}`);
    console.log(`   Date Range: March 20 - April 2, 2026`);
    console.log(`   Total Transactions: ${result.length}`);
    console.log(`   Total Income: ₹${totalIncome}`);
    console.log(`   Total Expense: ₹${totalExpense}`);
    console.log(`   Net Profit: ₹${profit}\n`);

    console.log('✅ Seed completed successfully\n');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Execute
connectDB().then(() => seedTwoWeeksData());
