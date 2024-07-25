package databases

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	neo4jdb "github.com/neo4j/neo4j-go-driver/v5/neo4j/db"
)

type Neo4jDatabase struct {
	driver   *neo4j.DriverWithContext
	context  context.Context
	database string
}

type Record *neo4jdb.Record

func NewNeo4jConnection(ctx context.Context, url, username, password, database, realm string) (*Neo4jDatabase, error) {
	driver, err := neo4j.NewDriverWithContext(url, neo4j.BasicAuth(username, password, realm))
	if err != nil {
		return nil, err
	}
	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		return nil, err
	}
	fmt.Println("Connected to Neo4j")
	return &Neo4jDatabase{
		driver:   &driver,
		database: database,
		context:  ctx,
	}, nil
}

func (db *Neo4jDatabase) NewSession() (neo4j.SessionWithContext, context.Context, context.CancelFunc) {
	ctx, cancel := context.WithTimeout(db.context, 10*time.Second)
	session := (*db.driver).NewSession(ctx, neo4j.SessionConfig{
		DatabaseName: db.database,
	})
	return session, ctx, func() {
		session.Close(ctx)
		cancel()
	}
}

func (db *Neo4jDatabase) Query(query string, params map[string]interface{}) ([]*neo4jdb.Record, error) {
	session, ctx, cancel := db.NewSession()
	defer cancel()

	if (query == "") || (params == nil) {
		return nil, fmt.Errorf("query and params must not be nil")
	}

	if strings.Contains(query, "CREATE") || strings.Contains(query, "SET") || strings.Contains(query, "DELETE") {
		result, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
			result, err := tx.Run(ctx, query, params)
			if err != nil {
				return nil, err
			}
			records, err := result.Collect(ctx)
			if err != nil {
				return nil, err
			}

			return records, nil
		})
		return result.([]*neo4jdb.Record), err

	}

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}
		records, err := result.Collect(ctx)
		if err != nil {
			return nil, err
		}

		return records, nil
	})
	return result.([]*neo4j.Record), err
}

func GetNode(record *neo4jdb.Record, key string) (*neo4j.Node, error) {
	node, _, err := neo4j.GetRecordValue[neo4j.Node](record, key)
	return &node, err
}

func (db *Neo4jDatabase) Close() {
	(*db.driver).Close(db.context)
}
