const { createClient } = require('redis');

let client;

async function initRedis() {
  let redisUrl = process.env.REDIS_URI;
  client = createClient({ url: redisUrl }).on('error', (e) => {
    console.error('Could not create redis client', e);
  });

  try {
    await client.connect();
    console.log(`Redis client connected at ${redisUrl}`);
  } catch (e) {
    console.error(`Error connecting to redis at ${redisUrl}`, e);
  }
};


function cacheEnabled() {
  const useCache = process.env.USE_CACHE;
  const bcache = useCache === "yes"
  return bcache;
};


function cacheMiddleware(options={EX: 3600}) {
  return async (req, res, next) => {
    const key = `${req.path}-${JSON.stringify(req.query)}`;
    let cacheValue = null;
    
    const useCache = process.env.USE_CACHE;
    const bcache = useCache === "yes"
    console.log(`Env var value is ${useCache}`);
    console.log(`Use Cache value is set as: ${bcache}`);

    const cachenabled = cacheEnabled();
    if (!cachenabled) {
      // Leave cacheValue undefined
    } else {
      cacheValue = await fetch(key);
    }

    if (cacheValue) {
      try {
        return res.json(JSON.parse(cacheValue));
      } catch (e) {
        return res.send(cacheValue);
      }
    } else {
      const send = res.send;
      res.send = function(data) {
        res.send = send;
        if (res.statusCode.toString().startsWith('2') && cachenabled) {
          write(key, JSON.stringify(data), options);
        }
        return res.send(data);
      }
      next();
    }
  }
}

async function write(key, data, options) {
  try {
    await client.set(key, data, options);
  } catch (e) {
    console.error(`Failed to store in Redis cache (${key}: ${data})`, e);
  }
}

async function fetch(key) {
  return await client.get(key);
}

module.exports = { initRedis: initRedis, cache: cacheMiddleware }
