/**
 * Script para crear un cliente temporal con datos de analytics precargados.
 * 
 * Ejecutar con: npx ts-node scripts/seed-test-analytics.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_CLIENT_SLUG = 'test_analytics_demo';

async function seedTestAnalytics() {
  console.log('🚀 Creando cliente de prueba con analytics...');

  // 1. Create test client
  const client = await prisma.client.create({
    data: {
      slug: TEST_CLIENT_SLUG,
      name: 'Demo Analytics Client',
      isActive: true,
      timezone: 'America/Mexico_City',
      meta: {
        pixelId: 'demo_pixel',
        accessToken: 'demo_token',
      },
      wassenger: {
        apiKey: 'demo_api_key',
        deviceId: 'demo_device_id',
      },
      reminderTemplates: {},
      locations: [],
    },
  });

  console.log(`✅ Cliente creado: ${client.id} (${client.slug})`);

  // 2. Create ClientStats with sample data
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  const stats = await prisma.clientStats.create({
    data: {
      clientId: client.id,
      totalLeads: 127,
      totalAppointments: 89,
      totalMessages: 1543,
      totalHandoffs: 34,
      totalNewConversations: 156,
      monthlyLeads: 23,
      monthlyAppointments: 15,
      monthlyMessages: 312,
      monthlyHandoffs: 8,
      monthlyNewConversations: 28,
      currentMonth: currentMonth,
    },
  });

  console.log(`✅ Stats creados: ${stats.id}`);

  // 3. Create sample events (last 7 days)
  const eventTypes = ['LEAD', 'APPOINTMENT', 'MESSAGE', 'HANDOFF', 'NEW_CONVERSATION'] as const;
  const samplePhones = [
    '5215512345678',
    '5215587654321',
    '5215599887766',
    '5215544332211',
    '5215566778899',
  ];

  const events = [];
  const now = new Date();

  for (let i = 0; i < 25; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const phone = samplePhones[Math.floor(Math.random() * samplePhones.length)];
    const hoursAgo = Math.floor(Math.random() * 168); // Random within last 7 days
    const eventDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    events.push({
      clientId: client.id,
      eventType,
      phone,
      createdAt: eventDate,
    });
  }

  await prisma.clientEvent.createMany({ data: events });

  console.log(`✅ ${events.length} eventos creados`);

  console.log('\n🎉 ¡Listo! Para ver el dashboard de analytics:');
  console.log(`   Navega a: /clients/${client.id}/analytics`);
  console.log('\n📌 Para borrar este cliente, ejecuta:');
  console.log('   npx ts-node scripts/cleanup-test-analytics.ts');

  await prisma.$disconnect();
}

seedTestAnalytics().catch((error) => {
  console.error('❌ Error:', error);
  prisma.$disconnect();
  process.exit(1);
});
