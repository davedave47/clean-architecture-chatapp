package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	context  context.Context
	database *mongo.Database
}

type Config struct {
	URL      string `mapstructure:"url"`
	Database string `mapstructure:"database"`
}

func NewMongoConnection(ctx context.Context, uri, database string) (*Database, error) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	return &Database{
		context:  ctx,
		database: client.Database(database),
	}, nil
}

func (db *Database) Close() {
	err := db.database.Client().Disconnect(db.context)
	if err != nil {
		panic(err)
	}
}

func (db *Database) GetCollection(name string) (*mongo.Collection, context.Context, context.CancelFunc) {
	ctx, cancel := context.WithTimeout(db.context, 5*time.Second)
	return db.database.Collection(name), ctx, cancel
}
