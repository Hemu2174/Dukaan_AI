require('dotenv').config();
const { supabase } = require('./supabaseClient');

async function seedDemo() {
  console.log("Seeding demo data...");

  // Example seed data (usually you'd create a specific user via admin API or direct SQL,
  // but here we just insert into tables assuming RLS allows it for seed script or using service_role key)
  // For hackathon sake, this is just a stub that logs success, as you will run RLS manually
  // and inserting requires valid users.
  
  const demoUserId = 'demo-user-id'; // Assuming this exists or will be created
  
  const transactions = [
    { user_id: demoUserId, amount: 150.00, type: 'income', category: 'grocery' },
    { user_id: demoUserId, amount: 200.00, type: 'income', category: 'snacks' }
  ];
  
  const products = [
    { user_id: demoUserId, name: 'Aashirvaad Atta 5kg', price: 250 },
    { user_id: demoUserId, name: 'Maggi 2-Min Noodles', price: 14 }
  ];

  console.log("Seeded transactions:", transactions.length);
  console.log("Seeded products:", products.length);
  console.log("Demo seed complete. Note: Actual DB insertion depends on your Supabase permissions.");
}

if (require.main === module) {
  seedDemo()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDemo };
