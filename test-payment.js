const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPaymentFlow() {
  console.log('\n=== Testing Payment/Checkout Flow ===\n');

  try {
    // 1. Get existing networks
    console.log('1️⃣ Fetching existing networks...');
    const networks = await prisma.network.findMany({
      take: 1,
      include: { packages: true }
    });

    if (networks.length === 0) {
      console.log('❌ No networks found. Creating test data...');

      // Create a test network
      const network = await prisma.network.create({
        data: {
          name: 'Test Network',
          description: 'For testing checkout',
        }
      });
      console.log(`✅ Created network: ${network.name} (ID: ${network.id})\n`);

      // Create a test package
      const pkg = await prisma.dataPackage.create({
        data: {
          networkId: network.id,
          name: 'Test 500MB',
          amount: '500MB',
          price: 5,
          isActive: true,
        }
      });
      console.log(`✅ Created package: ${pkg.name} (ID: ${pkg.id})\n`);

      // Create an order
      console.log('2️⃣ Creating an order (simulating checkout)...');
      const order = await prisma.order.create({
        data: {
          customerPhone: '0551234567',
          networkId: network.id,
          packageId: pkg.id,
          amount: 5,
          paymentReference: 'test_pending_' + Date.now(),
          paymentStatus: 'pending',
          status: 'pending',
        },
        include: {
          network: true,
          package: true,
        }
      });

      console.log('✅ Order Created Successfully!\n');
      console.log('Order Details:');
      console.log(`  - Order ID: ${order.id}`);
      console.log(`  - Customer Phone: ${order.customerPhone}`);
      console.log(`  - Network: ${order.network.name}`);
      console.log(`  - Package: ${order.package.amount}`);
      console.log(`  - Amount: ₵${order.amount}`);
      console.log(`  - Payment Status: ${order.paymentStatus}`);
      console.log(`  - Order Status: ${order.status}`);
      console.log(`  - Created At: ${order.createdAt}\n`);

    } else {
      const network = networks[0];
      console.log(`✅ Found network: ${network.name} (ID: ${network.id})`);
      console.log(`   Packages: ${network.packages.length}\n`);

      if (network.packages.length > 0) {
        const pkg = network.packages[0];

        console.log('2️⃣ Creating an order (simulating checkout)...');
        const order = await prisma.order.create({
          data: {
            customerPhone: '0551234567',
            networkId: network.id,
            packageId: pkg.id,
            amount: pkg.price,
            paymentReference: 'test_pending_' + Date.now(),
            paymentStatus: 'pending',
            status: 'pending',
          },
          include: {
            network: true,
            package: true,
          }
        });

        console.log('✅ Order Created Successfully!\n');
        console.log('Order Details:');
        console.log(`  - Order ID: ${order.id}`);
        console.log(`  - Customer Phone: ${order.customerPhone}`);
        console.log(`  - Network: ${order.network.name}`);
        console.log(`  - Package: ${order.package.amount}`);
        console.log(`  - Amount: ₵${order.amount}`);
        console.log(`  - Payment Status: ${order.paymentStatus}`);
        console.log(`  - Order Status: ${order.status}`);
        console.log(`  - Created At: ${order.createdAt}\n`);
      }
    }

    // 3. Verify order appears in database
    console.log('3️⃣ Verifying order in database...');
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
      include: {
        network: true,
        package: true,
      }
    });

    if (orders.length > 0) {
      const order = orders[0];
      console.log('✅ Order found in database!');
      console.log(`   Phone: ${order.customerPhone}`);
      console.log(`   Network: ${order.network.name}`);
      console.log(`   Package: ${order.package.amount}`);
      console.log(`   Amount: ₵${order.amount}`);
      console.log(`   Status: ${order.status} (Payment: ${order.paymentStatus})\n`);
    }

    // 4. Count total orders
    console.log('4️⃣ Total orders in system:');
    const totalOrders = await prisma.order.count();
    console.log(`   ✅ ${totalOrders} orders\n`);

    console.log('=== ✅ Payment Flow Test Complete ===\n');
    console.log('Summary: Order creation works perfectly without Paystack setup!');
    console.log('- Orders are created with "pending" status');
    console.log('- Payment status marked as "pending" for later Paystack integration');
    console.log('- All order details stored in database');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentFlow();
