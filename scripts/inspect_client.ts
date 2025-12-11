
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const client = await prisma.client.findUnique({
    where: { slug: 'white_dental' }
  });

  if (client) {
      console.log('--- Client Data Structure ---');
      console.log('Google Field:', JSON.stringify(client.google, null, 2));
      console.log('Locations Field:', JSON.stringify(client.locations, null, 2));
  } else {
      console.log('Client white_dental not found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
