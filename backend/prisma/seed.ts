import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test account...');

  const TEST_EMAIL = 'owner@platera-test.com';
  const TEST_PASSWORD = 'Test1234!';
  const RESTAURANT_NAME = 'Platera Test Kitchen';

  // Check if test restaurant already exists
  const existing = await prisma.restaurant.findFirst({
    where: { contactEmail: TEST_EMAIL },
  });

  if (existing) {
    console.log(`✅ Test account already exists. Login with: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const restaurant = await prisma.restaurant.create({
    data: {
      name: RESTAURANT_NAME,
      contactPhone: '+233200000001',
      contactEmail: TEST_EMAIL,
      address: '1 Platera Way, Accra, Ghana',
      subscriptionStatus: 'TRIAL',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  await prisma.user.create({
    data: {
      restaurantId: restaurant.id,
      email: TEST_EMAIL,
      passwordHash: hashedPassword,
      phone: '+233200000001',
      name: 'Platera Owner',
      role: Role.OWNER,
      status: Status.ACTIVE,
    },
  });

  console.log(`✅ Test account created!`);
  console.log(`   Email:    ${TEST_EMAIL}`);
  console.log(`   Password: ${TEST_PASSWORD}`);
  console.log(`   Restaurant: ${RESTAURANT_NAME}`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
