const { createClient } = require('redis');

async function initRedis() {
  let redisUrl = process.env.REDIS_URI;
  let redisClient = createClient({ url: redisUrl }).on('error', (e) => {
    console.error('Could not create redis client', e);
  });

  try {
    await redisClient.connect();
    console.log(`Redis client connected at ${redisUrl}`);
  } catch (e) {
    console.error(`Error connecting to redis at ${redisUrl}`, e);
  }
};

module.exports = { initRedis: initRedis }
