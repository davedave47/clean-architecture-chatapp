package initializer

import (
	"os"
	"strconv"

	"github.com/redis/go-redis/v9"
)

func loadConfig() {
	// Load configuration from environment variables
	loadNeo4jConfig(&Neo4jConfiguration{
		Url:      os.Getenv("NEO4J_URL"),
		Username: os.Getenv("NEO4J_USERNAME"),
		Password: os.Getenv("NEO4J_PASSWORD"),
	})
	db, err := strconv.Atoi(os.Getenv("REDIS_DB"))
	if err != nil {
		panic(err)
	}
	loadRedisConfig(&redis.Options{
		Addr:     os.Getenv("REDIS_URL"),
		Username: os.Getenv("REDIS_USERNAME"),
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       db,
	})
	loadMongoConfig(&MongoConfiguration{
		URI:      os.Getenv("MONGO_URL"),
		Database: os.Getenv("MONGO_DATABASE"),
	})
}
