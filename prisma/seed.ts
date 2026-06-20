import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const adminEmail = 'admin@zetadata.com';
  const adminPassword = 'password123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create networks
  const networks = [
    {
      name: 'MTN',
      description: 'MTN Nigeria - Largest network',
    },
    {
      name: 'Airtel',
      description: 'Airtel Nigeria',
    },
    {
      name: 'Glo',
      description: 'Globacom Nigeria',
    },
    {
      name: '9mobile',
      description: '9mobile Nigeria',
    },
  ];

  const createdNetworks = [];
  for (const network of networks) {
    const createdNetwork = await prisma.network.upsert({
      where: { name: network.name },
      update: {},
      create: {
        name: network.name,
        description: network.description,
      },
    });
    createdNetworks.push(createdNetwork);
    console.log(`✅ Network created: ${createdNetwork.name}`);
  }

  // Create data packages for each network
  const packages = [
    { amount: '100MB', price: 100 },
    { amount: '500MB', price: 500 },
    { amount: '1GB', price: 1000 },
    { amount: '2GB', price: 1500 },
    { amount: '5GB', price: 2500 },
    { amount: '10GB', price: 4000 },
    { amount: '20GB', price: 7000 },
  ];

  for (const network of createdNetworks) {
    for (const pkg of packages) {
      const existingPackage = await prisma.dataPackage.findFirst({
        where: {
          networkId: network.id,
          name: pkg.amount,
        },
      });

      if (!existingPackage) {
        const createdPackage = await prisma.dataPackage.create({
          data: {
            name: pkg.amount,
            amount: pkg.amount,
            price: pkg.price,
            networkId: network.id,
            description: `${pkg.amount} data package for ${network.name}`,
          },
        });
        console.log(
          `  ✅ Package created: ${network.name} - ${createdPackage.name} (₦${createdPackage.price})`
        );
      } else {
        console.log(
          `  ℹ️  Package exists: ${network.name} - ${existingPackage.name}`
        );
      }
    }
  }

  console.log('\n✨ Database seeded successfully!');
  console.log('\nCreated:');
  console.log(`- 1 Admin account (${adminEmail} / ${adminPassword})`);
  console.log(`- 4 Networks (MTN, Airtel, Glo, 9mobile)`);
  console.log(`- 28 Data packages (7 packages per network)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
