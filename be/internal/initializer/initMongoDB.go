package initializer

import (
	"context"
	"fmt"
	"log"
	databases "root/internal/infras/db"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoConfiguration struct {
	URI      string
	Database string
}

var mongoConfig *MongoConfiguration

func initMongo() (*databases.MongoDatabase, func()) {
	ctx := context.Background()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoConfig.URI))
	if err != nil {
		log.Fatalf("Failed to create mongo client: %v", err)
	}
	fmt.Println("Connected to MongoDB")
	return &databases.MongoDatabase{
			Context:  ctx,
			Database: client.Database(mongoConfig.Database),
		}, func() {
			client.Disconnect(ctx)
		}
}

func loadMongoConfig(config *MongoConfiguration) {
	mongoConfig = config
}
