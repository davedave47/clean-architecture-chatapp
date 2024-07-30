package initializer

import (
	"context"
	"fmt"
	databases "root/internal/infras/db"
)

// Neo4jDB is the struct for neo4j database
type Neo4jConfiguration struct {
	Url      string
	Username string
	Password string
	Database string
}

var neo4jConfig *Neo4jConfiguration

func initNeo4j() (*databases.Neo4jDatabase, func()) {
	connection, err := databases.NewNeo4jConnection(context.Background(), neo4jConfig.Url, neo4jConfig.Username, neo4jConfig.Password, neo4jConfig.Database, "")
	if err != nil {
		fmt.Println("Failed to connect to Neo4j")
		panic(err)
	}
	fmt.Println("Connected to Neo4j")
	return connection, connection.Close
}

func loadNeo4jConfig(config *Neo4jConfiguration) {
	neo4jConfig = config
}
