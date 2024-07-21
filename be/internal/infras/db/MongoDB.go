package databases

import (
	"context"

	"go.mongodb.org/mongo-driver/mongo"
)

type MongoDatabase struct {
	Context  context.Context
	Database *mongo.Database
}
