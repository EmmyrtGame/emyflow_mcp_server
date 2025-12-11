
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up serviceAccountPath from Client.google JSON...');
  
  // Using direct SQL for MySQL JSON manipulation
  try {
      // JSON_REMOVE returns the original json if path looks valid but key missing, or updated json.
      const result = await prisma.$executeRaw`UPDATE Client SET google = JSON_REMOVE(google, '$.serviceAccountPath')`;
      console.log(`Updated clients: ${result}`);
  } catch (e) {
      console.error("Error executing raw sql:", e);
      // Fallback: iterate and update
      const clients = await prisma.client.findMany();
      for (const client of clients) {
          const google = client.google as any;
          if (google && google.serviceAccountPath) {
              delete google.serviceAccountPath;
              await prisma.client.update({
                  where: { id: client.id },
                  data: { google }
              });
              console.log(`Cleaned client ${client.slug}`);
          }
      }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
