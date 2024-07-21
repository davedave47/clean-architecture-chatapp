package databases

import (
	"context"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type Neo4jDatabase struct {
	Driver   *neo4j.DriverWithContext
	Context  context.Context
	Database string
}

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
