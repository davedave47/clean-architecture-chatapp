package initializer

import (
	"os"
	databases "root/internal/infras/db"

	"github.com/joho/godotenv"
)

func Run() {
	godotenv.Load()
	loadConfig()

	neo4jDatabase, cleanupNeo4j := initNeo4j()
	databases.UserDB = neo4jDatabase
	defer cleanupNeo4j()

	mongoDatabase, cleanupMongo := initMongo()
	databases.MessageDB = mongoDatabase
	defer cleanupMongo()

	r := InitRouter()
	server := InitSocket(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	server.Listen(":" + port)
}
