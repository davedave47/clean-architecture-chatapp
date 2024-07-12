package initializer

import (
	databases "root/internal/infras/db"

	"github.com/redis/go-redis/v9"
)

var redisConfig *redis.Options

func initRedis() (*databases.RedisDatabase, func()) {
	client := redis.NewClient(redisConfig)
	return &databases.RedisDatabase{
			Client: client,
		}, func() {
			client.Close()
		}
}

func loadRedisConfig(config *redis.Options) {
	redisConfig = config
}
