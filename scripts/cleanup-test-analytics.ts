/**
 * Script para borrar el cliente de prueba y sus datos de analytics.
 * 
 * Ejecutar con: npx ts-node scripts/cleanup-test-analytics.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_CLIENT_SLUG = 'test_analytics_demo';

async function cleanupTestAnalytics() {
  console.log('🧹 Buscando cliente de prueba...');

  const client = await prisma.client.findUnique({
    where: { slug: TEST_CLIENT_SLUG },
  });

  if (!client) {
    console.log('⚠️  No se encontró el cliente de prueba. Nada que borrar.');
    await prisma.$disconnect();
    return;
  }

  console.log(`📌 Cliente encontrado: ${client.id} (${client.name})`);

  // Delete events first (foreign key)
  const deletedEvents = await prisma.clientEvent.deleteMany({
    where: { clientId: client.id },
  });
  console.log(`🗑️  ${deletedEvents.count} eventos eliminados`);

  // Delete stats
  const deletedStats = await prisma.clientStats.deleteMany({
    where: { clientId: client.id },
  });
  console.log(`🗑️  ${deletedStats.count} stats eliminados`);

  // Delete client
  await prisma.client.delete({
    where: { id: client.id },
  });
  console.log(`🗑️  Cliente "${client.name}" eliminado`);

  console.log('\n✅ Limpieza completada!');

  await prisma.$disconnect();
}

cleanupTestAnalytics().catch((error) => {
  console.error('❌ Error:', error);
  prisma.$disconnect();
  process.exit(1);
});
