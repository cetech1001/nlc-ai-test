import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate random date within range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate sample transactions
const generateSampleTransactions = async (coaches: any[], plans: any[]) => {
  const transactionCount = 50; // Number of transactions to create
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  for (let i = 0; i < transactionCount; i++) {
    const coach = coaches[Math.floor(Math.random() * coaches.length)];
    const plan = plans[Math.floor(Math.random() * plans.length)];

    // Random transaction date within the last year
    const transactionDate = randomDate(oneYearAgo, new Date());

    // Random invoice date within 30 days before transaction
    const invoiceDate = new Date(transactionDate);
    invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 30));

    // Mostly completed transactions, some pending/failed
    const statusRandom = Math.random();
    let status = 'completed';
    if (statusRandom < 0.05) status = 'failed';
    else if (statusRandom < 0.1) status = 'pending';

    try {
      await prisma.transactions.create({
        data: {
          coachId: coach.id,
          planId: plan.id,
          amount: Math.random() > 0.5 ? plan.monthlyPrice : plan.annualPrice,
          currency: 'USD',
          status: status as any,
          paymentMethod: ['credit_card', 'debit_card', 'paypal'][Math.floor(Math.random() * 3)] as any,
          invoiceNumber: `INV-${Date.now()}-${i}`,
          invoiceDate,
          paidAt: status === 'completed' ? transactionDate : null,
          description: `Payment for ${plan.name} plan`,
          createdAt: transactionDate,
          updatedAt: transactionDate,
        },
      });
    } catch (error) {
      console.log(`⚠️  Skipped transaction ${i} due to constraint`);
    }
  }

  console.log(`✅ Created ${transactionCount} sample transactions`);
};

// Generate sample subscriptions
const generateSampleSubscriptions = async (coaches: any[], plans: any[]) => {
  for (const coach of coaches.slice(0, 8)) { // First 8 coaches get subscriptions
    const plan = plans[Math.floor(Math.random() * plans.length)];

    // Random subscription start date within last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startDate = randomDate(sixMonthsAgo, new Date());

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    try {
      await prisma.subscriptions.create({
        data: {
          coachId: coach.id,
          planId: plan.id,
          status: coach.isActive ? 'active' : 'canceled',
          billingCycle: 'monthly',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          nextBillingDate: coach.isActive ? endDate : null,
          canceledAt: !coach.isActive ? endDate : null,
          createdAt: startDate,
          updatedAt: startDate,
        },
      });
    } catch (error) {
      console.log(`⚠️  Skipped subscription for coach ${coach.email}`);
    }
  }

  console.log(`✅ Created subscriptions for coaches`);
};

async function seedDashboardData() {
  try {
    console.log('🌱 Seeding dashboard sample data...');

    // Get existing plans
    const plans = await prisma.plans.findMany({
      where: { isActive: true }
    });

    if (plans.length === 0) {
      console.log('❌ No plans found. Please run seed:plans first');
      return;
    }

    // Generate sample coaches
    console.log('👥 Creating sample coaches...');
    const coaches = await await prisma.coaches.findMany({
      where: { subscriptions: {  } }
    });

    // Generate sample transactions
    console.log('💰 Creating sample transactions...');
    await generateSampleTransactions(coaches, plans);

    // Generate sample subscriptions
    console.log('📋 Creating sample subscriptions...');
    await generateSampleSubscriptions(coaches, plans);

    console.log('🎉 Dashboard data seeding completed successfully!');

    // Show summary
    const [totalCoaches, totalTransactions, totalSubscriptions] = await Promise.all([
      prisma.coaches.count(),
      prisma.transactions.count(),
      prisma.subscriptions.count(),
    ]);

    console.log('📊 Database Summary:');
    console.log(`   - Total coaches: ${totalCoaches}`);
    console.log(`   - Total transactions: ${totalTransactions}`);
    console.log(`   - Total subscriptions: ${totalSubscriptions}`);

  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDashboardData();
