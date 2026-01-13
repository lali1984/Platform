const { Kafka } = require('kafkajs');

console.log('Starting Kafka KRaft consumer on port 29092...\n');

const kafka = new Kafka({
  clientId: 'kraft-consumer',
  brokers: ['localhost:29092']
});

async function startConsumer() {
  const consumer = kafka.consumer({ 
    groupId: 'kraft-test-group-' + Date.now() 
  });

  await consumer.connect();
  console.log('✅ Consumer connected');
  
  await consumer.subscribe({ 
    topic: 'user-events', 
    fromBeginning: false 
  });
  
  console.log('✅ Subscribed to user-events');
  console.log('⏳ Waiting for user.registered events...\n');
  
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        if (event.type === 'user.registered') {
          console.log('🎉 USER REGISTERED EVENT RECEIVED!');
          console.log('   User ID:', event.data.userId);
          console.log('   Email:', event.data.email);
          console.log('   Source:', event.source);
          console.log('   ---\n');
        }
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    }
  });
  
  console.log('Consumer running. Press Ctrl+C to stop.\n');
  
  // Keep alive
  process.on('SIGINT', async () => {
    await consumer.disconnect();
    console.log('\nConsumer stopped');
    process.exit(0);
  });
}

startConsumer().catch(console.error);
