package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Database struct {
	client  *redis.Client
	context context.Context
}

type Config struct {
	URL      string `mapstructure:"url"`
	Password string `mapstructure:"password"`
	Database int    `mapstructure:"database"`
}

func NewRedisConnection(ctx context.Context, addr, password string, db int) (*Database, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})
	client.FlushAll(ctx)
	return &Database{
		client:  client,
		context: ctx,
	}, nil
}

func (db *Database) Set(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.Set(ctx, key, value, 0).Err()
}

func (db *Database) Get(key string) (string, error) {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.Get(ctx, key).Result()
}

func (db *Database) Del(key string) error {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.Del(ctx, key).Err()
}

func (db *Database) Close() {
	err := db.client.Close()
	if err != nil {
		panic(err)
	}
}

func (db *Database) SMembers(key string) ([]string, error) {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.SMembers(ctx, key).Result()
}

func (db *Database) SAdd(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.SAdd(ctx, key, value).Err()
}

func (db *Database) SRem(key string, value any) error {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.SRem(ctx, key, value).Err()
}

func (db *Database) SCard(key string) (int64, error) {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	defer cancel()
	return db.client.SCard(ctx, key).Result()
}
