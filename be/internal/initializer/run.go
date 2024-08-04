package initializer

import (
	"fmt"
	"os"
	"root/config"
	"root/internal/infras/databases"
)

func Run() {
	loadConfig()

	userDB, cleanupUserDB := initUserDB()
	databases.UserDB = userDB
	defer cleanupUserDB()

	messageDB, cleanupMessageDB := initMessageDB()
	databases.MessageDB = messageDB
	defer cleanupMessageDB()

	socketDB, cleanupSocketDB := initSocketDB()
	databases.SocketDB = socketDB
	defer cleanupSocketDB()

	r := InitRouter()
	server := InitSocket(r)

	serverConfig := config.Config.Server

	err := server.ListenTLS(":"+serverConfig.Port, serverConfig.SSL.CertPath, serverConfig.SSL.KeyPath)
	if err != nil {
		fmt.Println(os.Getwd())
		panic(err)
	}
	fmt.Println("Server is running on port", serverConfig.Port)
}
