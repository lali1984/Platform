const { createClient } = require('redis');

console.log('🎧 Starting Redis event listener...\n');

const client = createClient({
  url: 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error:', err));

async function listenForEvents() {
  await client.connect();
  console.log('✅ Connected to Redis');
  
  const subscriber = client.duplicate();
  await subscriber.connect();
  
  await subscriber.subscribe('platform-events', (message) => {
    try {
      const event = JSON.parse(message);
      console.log('📨 EVENT RECEIVED:');
      console.log(`  Type: ${event.type}`);
      console.log(`  Source: ${event.source}`);
      console.log(`  Timestamp: ${new Date(event.timestamp).toLocaleTimeString()}`);
      
      if (event.type === 'user.registered') {
        console.log(`  👤 User Registered: ${event.data.email}`);
        console.log(`     User ID: ${event.data.userId}`);
      } else if (event.type === 'user.logged.in') {
        console.log(`  🔐 User Logged In: ${event.data.email}`);
      }
      
      console.log('  ---\n');
    } catch (error) {
      console.error('Error parsing event:', error.message);
    }
  });
  
  console.log('✅ Subscribed to platform-events channel');
  console.log('⏳ Waiting for events...\n');
  
  // Also monitor event stream
  setInterval(async () => {
    try {
      const streamData = await client.xRead(
        { key: 'event-stream', id: '0' },
        { COUNT: 10, BLOCK: 5000 }
      );
      
      if (streamData && streamData.length > 0) {
        console.log(`📊 Event stream has ${streamData[0].messages.length} messages`);
      }
    } catch (error) {
      // Ignore timeout errors
      if (!error.message.includes('Timeout')) {
        console.error('Stream read error:', error.message);
      }
    }
  }, 10000);
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🔻 Shutting down listener...');
    await subscriber.unsubscribe();
    await subscriber.quit();
    await client.quit();
    console.log('✅ Listener shutdown complete');
    process.exit(0);
  });
}

listenForEvents().catch(console.error);
