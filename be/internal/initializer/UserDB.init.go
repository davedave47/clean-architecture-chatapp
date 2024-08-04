package initializer

import (
	"context"
	"fmt"
	"root/config"
	"root/pkg/databases/neo4j"
)

func initUserDB() (*neo4j.Database, func()) {
	neo4jConfig := config.Config.Database.Neo4j
	connection, err := neo4j.NewNeo4jConnection(
		context.Background(),
		neo4jConfig.URL,
		neo4jConfig.Username,
		neo4jConfig.Password,
		neo4jConfig.Database,
		"",
	)
	if err != nil {
		fmt.Println("Failed to connect to Neo4j")
		panic(err)
	}
	fmt.Println("Connected to Neo4j")
	return connection, connection.Close
}
