const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function setupPaystack() {
  console.log('\n=== Setting up Paystack Configuration ===\n');

  try {
    // Paystack test keys
    const paystackPublicKey = 'pk_test_50b5c7c8bcec5bebf5982bd5a96751944eed33fc';
    const paystackSecretKey = 'sk_test_07ba677a8e14affe470cfea1563c0e1a6bd1b4c7';

    console.log('📝 Saving Paystack keys to database...');

    // Find or create settings
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          paystackPublicKey,
          paystackSecretKey,
          paystackTestMode: true,
        },
      });
      console.log('✅ Created new settings with Paystack keys');
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          paystackPublicKey,
          paystackSecretKey,
          paystackTestMode: true,
        },
      });
      console.log('✅ Updated existing settings with Paystack keys');
    }

    console.log('\n📊 Paystack Configuration:');
    console.log(`   Public Key: ${paystackPublicKey.substring(0, 20)}...`);
    console.log(`   Secret Key: ${paystackSecretKey.substring(0, 20)}...`);
    console.log(`   Test Mode: true`);
    console.log(`   Status: ✅ Active\n`);

    console.log('=== ✅ Paystack Setup Complete ===\n');
    console.log('You can now:');
    console.log('1. Navigate to http://localhost:3000/shop');
    console.log('2. Select a network and package');
    console.log('3. Enter a test phone number (e.g., 0551234567)');
    console.log('4. Click "Pay with Paystack"');
    console.log('5. Use Paystack test cards to complete payment\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupPaystack();
