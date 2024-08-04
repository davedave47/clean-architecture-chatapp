package initializer

import (
	"context"
	"root/config"
	"root/pkg/databases/redis"
)

func initSocketDB() (*redis.Database, func()) {
	redisConfig := config.Config.Database.Redis
	connection, err := redis.NewRedisConnection(
		context.Background(),
		redisConfig.URL,
		redisConfig.Password,
		redisConfig.Database,
	)
	if err != nil {
		panic(err)
	}
	return connection, connection.Close
}
