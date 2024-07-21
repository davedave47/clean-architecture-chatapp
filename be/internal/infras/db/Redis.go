package databases

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisDatabase struct {
	Client  *redis.Client
	Context context.Context
}

func (db *RedisDatabase) Set(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.Context, 5*time.Second)
	defer cancel()
	return db.Client.Set(ctx, key, value, 0).Err()
}

func (db *RedisDatabase) Get(key string) (string, error) {
	ctx, cancel := context.WithTimeout(db.Context, 5*time.Second)
	defer cancel()
	return db.Client.Get(ctx, key).Result()
}

func (db *RedisDatabase) Del(key string) error {
	ctx, cancel := context.WithTimeout(db.Context, 5*time.Second)
	defer cancel()
	return db.Client.Del(ctx, key).Err()
}

func (db *RedisDatabase) Close() error {
	return db.Client.Close()
}

func (db *RedisDatabase) SMembers(key string) ([]string, error) {
	ctx, cancel := context.WithTimeout(db.Context, 5*time.Second)
	defer cancel()
	return db.Client.SMembers(ctx, key).Result()
}

func (db *RedisDatabase) SAdd(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.Context, 5*time.Second)
	defer cancel()
	return db.Client.SAdd(ctx, key, value).Err()
}

func (db *RedisDatabase) SRem(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.Context, 5*time.Second)
	defer cancel()
	return db.Client.SRem(ctx, key, value).Err()
}

func (db *RedisDatabase) SCard(key string) (int64, error) {
	ctx, cancel := context.WithTimeout(db.Context, 5*time.Second)
	defer cancel()
	return db.Client.SCard(ctx, key).Result()
}
