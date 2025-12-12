
import { clientService } from '../src/services/client.service';
import { PrismaClient } from '@prisma/client';

async function testLookup() {
    console.log('Testing Optimized Lookup...');
    
    // 1. Get a known device ID from DB directly to use as test case
    const prisma = new PrismaClient();
    const client = await prisma.client.findUnique({
        where: { slug: 'white_dental' }
    });

    if (!client || !client.wassengerDeviceId) {
        console.error('Test failed: white_dental client not found or not migrated (no wassengerDeviceId)');
        return;
    }

    const testDeviceId = client.wassengerDeviceId;
    console.log(`Using Device ID: ${testDeviceId}`);

    // 2. Measure lookup time
    const start = process.hrtime();
    const result = await clientService.getClientByDeviceId(testDeviceId);
    const end = process.hrtime(start);
    const timeMs = (end[0] * 1000 + end[1] / 1e6).toFixed(3);

    if (result && result.slug === 'white_dental') {
        console.log(`✅ Success! Found client: ${result.slug}`);
        console.log(`Lookup Time: ${timeMs}ms`);
    } else {
        console.error('❌ Failed! Client not found via service.');
    }
    
    await prisma.$disconnect();
}

testLookup();
