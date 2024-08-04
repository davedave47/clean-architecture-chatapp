package initializer

import (
	"context"
	"root/config"
	"root/pkg/databases/mongodb"
)

func initMessageDB() (*mongodb.Database, func()) {
	mongoConfig := config.Config.Database.Mongo

	connection, err := mongodb.NewMongoConnection(
		context.Background(),
		mongoConfig.URL,
		mongoConfig.Database,
	)

	if err != nil {
		panic(err)
	}
	return connection, connection.Close
}
