package databases

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDatabase struct {
	context  context.Context
	database *mongo.Database
}

func NewMongoConnection(ctx context.Context, uri, database string) (*MongoDatabase, error) {
	// ctx := context.Background()
	// client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoConfig.URI))
	// if err != nil {
	// 	log.Fatalf("Failed to create mongo client: %v", err)
	// }
	// fmt.Println("Connected to MongoDB")
	// return &databases.MongoDatabase{
	// 		Context:  ctx,
	// 		Database: client.Database(mongoConfig.Database),
	// 	}, func() {
	// 		client.Disconnect(ctx)
	// 	}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	return &MongoDatabase{
		context:  ctx,
		database: client.Database(database),
	}, nil
}

func (db *MongoDatabase) Close() {
	err := db.database.Client().Disconnect(db.context)
	if err != nil {
		panic(err)
	}
}

func (db *MongoDatabase) GetCollection(name string) (*mongo.Collection, context.Context, context.CancelFunc) {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	return db.database.Collection(name), ctx, cancel
}
