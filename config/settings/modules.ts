export default () => ({
  modules: {
    ClusterModule: {
      enabled: false,
      workers: null
    },
    ApiKeyModule: {
      enabled: false
    },
    ThrottlerModule: {
      enabled: true,
      config: {
        ttl: 60,
        limit: 250,
        // default || redis
        storage: 'redis',
        redis: {
          host: process.env.REDIS_URL,
          port: process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWORD,
          ttl: 120
        }        
      }
    }
  }
});
