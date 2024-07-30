package initializer

import (
	"context"
	databases "root/internal/infras/db"
)

type MongoConfiguration struct {
	URI      string
	Database string
}

var mongoConfig *MongoConfiguration

func initMongo() (*databases.MongoDatabase, func()) {
	connection, err := databases.NewMongoConnection(context.Background(), mongoConfig.URI, mongoConfig.Database)
	if err != nil {
		panic(err)
	}
	return connection, connection.Close
}

func loadMongoConfig(config *MongoConfiguration) {
	mongoConfig = config
}
