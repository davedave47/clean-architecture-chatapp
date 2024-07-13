package initializer

import (
	"context"
	"fmt"
	databases "root/internal/infras/db"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
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
	ctx := context.Background()
	driver, err := neo4j.NewDriverWithContext(
		neo4jConfig.Url,
		neo4j.BasicAuth(neo4jConfig.Username, neo4jConfig.Password, ""))
	if err != nil {
		panic(err)
	}
	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		panic(err)
	}
	fmt.Println("Connected to Neo4j")
	return &databases.Neo4jDatabase{
			Driver:   &driver,
			Database: neo4jConfig.Database,
			Context:  ctx,
		}, func() {
			driver.Close(ctx)
		}
}

func loadNeo4jConfig(config *Neo4jConfiguration) {
	neo4jConfig = config
}
