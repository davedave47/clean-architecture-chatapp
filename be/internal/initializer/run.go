package initializer

import (
	"os"
	databases "root/internal/infras/db"
	"root/internal/infras/socket"

	"github.com/joho/godotenv"
)

func Run() {
	godotenv.Load()
	loadConfig()

	neo4jDatabase, cleanupNeo4j := initNeo4j()
	databases.UserDB = neo4jDatabase
	defer cleanupNeo4j()

	redisDatabase, cleanupRedis := initRedis()
	databases.OnlineCache = redisDatabase
	defer cleanupRedis()

	mongoDatabase, cleanupMongo := initMongo()
	databases.MessageDB = mongoDatabase
	defer cleanupMongo()

	r := InitRouter()
	socket.InitSocket(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	r.Listen(":" + port)

}
