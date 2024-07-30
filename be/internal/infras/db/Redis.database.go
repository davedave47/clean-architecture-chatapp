package databases

import (
	"context"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisDatabase struct {
	client  *redis.Client
	context context.Context
}

func NewRedisConnection(ctx context.Context, addr, password, db string) (*RedisDatabase, error) {
	dbInt, err := strconv.Atoi(db)
	if err != nil {
		return nil, err

	}
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       dbInt,
	})
	client.FlushAll(ctx)
	return &RedisDatabase{
		client:  client,
		context: ctx,
	}, nil
}

func (db *RedisDatabase) Set(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.Set(ctx, key, value, 0).Err()
}

func (db *RedisDatabase) Get(key string) (string, error) {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.Get(ctx, key).Result()
}

func (db *RedisDatabase) Del(key string) error {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.Del(ctx, key).Err()
}

func (db *RedisDatabase) Close() {
	err := db.client.Close()
	if err != nil {
		panic(err)
	}
}

func (db *RedisDatabase) SMembers(key string) ([]string, error) {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.SMembers(ctx, key).Result()
}

func (db *RedisDatabase) SAdd(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.SAdd(ctx, key, value).Err()
}

func (db *RedisDatabase) SRem(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.SRem(ctx, key, value).Err()
}

func (db *RedisDatabase) SCard(key string) (int64, error) {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.SCard(ctx, key).Result()
}
