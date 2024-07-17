package databases

import (
	"context"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"go.mongodb.org/mongo-driver/mongo"
)

type Neo4jDatabase struct {
	Driver   *neo4j.DriverWithContext
	Context  context.Context
	Database string
}

type MongoDatabase struct {
	Context  context.Context
	Database *mongo.Database
}

var UserDB *Neo4jDatabase
var MessageDB *MongoDatabase

func (db *Neo4jDatabase) NewSession() (neo4j.SessionWithContext, context.Context, context.CancelFunc) {
	ctx, cancel := context.WithTimeout(db.Context, 10*time.Second)
	session := (*db.Driver).NewSession(ctx, neo4j.SessionConfig{
		DatabaseName: db.Database,
	})
	return session, ctx, func() {
		session.Close(ctx)
		cancel()
	}
}
