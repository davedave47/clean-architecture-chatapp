package initializer

import (
	"context"
	databases "root/internal/infras/db"
	"strconv"

	"github.com/redis/go-redis/v9"
)

type RedisConfiguration struct {
	Addr     string
	Password string
	DB       string
}

var redisConfig *RedisConfiguration

func initRedis() (*databases.RedisDatabase, func()) {
	db, err := strconv.Atoi(redisConfig.DB)
	if err != nil {
		panic(err)

	}
	client := redis.NewClient(&redis.Options{
		Addr:     redisConfig.Addr,
		Password: redisConfig.Password,
		DB:       db,
	})
	client.FlushAll(context.Background())
	return &databases.RedisDatabase{
			Client:  client,
			Context: context.Background(),
		}, func() {
			err := client.Close()
			if err != nil {
				panic(err)
			}
		}
}

func loadRedisConfig(config *RedisConfiguration) {
	redisConfig = config
}
