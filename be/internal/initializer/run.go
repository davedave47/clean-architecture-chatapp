package initializer

import (
	"fmt"
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

	redisDatabase, cleanupRedis := initRedis()
	databases.SocketDB = redisDatabase
	defer cleanupRedis()

	r := InitRouter()
	server := InitSocket(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	err := server.ListenTLS(":"+port, os.Getenv("SSL_CERT_PATH"), os.Getenv("SSL_KEY_PATH"))
	if err != nil {
		fmt.Println(os.Getwd())
		panic(err)
	}
	fmt.Println("Server is running on port", port)
}
