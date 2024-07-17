package initializer

import (
	"os"
)

func loadConfig() {
	// Load configuration from environment variables
	loadNeo4jConfig(&Neo4jConfiguration{
		Url:      os.Getenv("NEO4J_URL"),
		Username: os.Getenv("NEO4J_USERNAME"),
		Password: os.Getenv("NEO4J_PASSWORD"),
	})
	loadMongoConfig(&MongoConfiguration{
		URI:      os.Getenv("MONGO_URL"),
		Database: os.Getenv("MONGO_DATABASE"),
	})
}
