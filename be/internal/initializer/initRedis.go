package initializer

import (
	"context"
	databases "root/internal/infras/db"
)

type RedisConfiguration struct {
	Addr     string
	Password string
	DB       string
}

var redisConfig *RedisConfiguration

func initRedis() (*databases.RedisDatabase, func()) {
	connection, err := databases.NewRedisConnection(context.Background(), redisConfig.Addr, redisConfig.Password, redisConfig.DB)
	if err != nil {
		panic(err)
	}
	return connection, connection.Close
}

func loadRedisConfig(config *RedisConfiguration) {
	redisConfig = config
}
