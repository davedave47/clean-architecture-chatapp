package databases

import (
	"context"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
)

type Neo4jDatabase struct {
	Driver   *neo4j.DriverWithContext
	Context  context.Context
	Database string
}

type RedisDatabase struct {
	Client  *redis.Client
	Context context.Context
}

type MongoDatabase struct {
	Client   *mongo.Client
	Context  context.Context
	Database string
}

var UserDB *Neo4jDatabase
var OnlineCache *RedisDatabase
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
