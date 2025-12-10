import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting test clients...');
  
  const { count } = await prisma.client.deleteMany({
    where: {
      slug: {
        startsWith: 'seed_test_'
      }
    }
  });

  console.log(`Deleted ${count} test clients.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
