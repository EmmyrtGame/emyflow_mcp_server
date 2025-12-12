import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/admin/utils/crypto.util';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration of wassengerId...');
  const clients = await prisma.client.findMany();

  for (const client of clients) {
    const wassenger = client.wassenger as any;
    if (wassenger && wassenger.deviceId) {
      console.log(`Migrating client ${client.slug} with deviceId: ${wassenger.deviceId}`);
      
      try {
        await prisma.client.update({
          where: { id: client.id },
          data: {
            wassengerDeviceId: wassenger.deviceId
          }
        });
        console.log(`✅ Updated ${client.slug}`);
      } catch (error) {
         console.error(`❌ Failed to update ${client.slug}:`, error);
      }
    } else {
      console.log(`Skipping client ${client.slug} (No deviceId found in JSON)`);
    }
  }
  console.log('Migration complete.');
}

migrate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
