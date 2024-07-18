package initializer

import (
	"root/internal/adapter/controllers"
	"root/internal/adapter/middleware"
	"root/internal/domain/usecases"
	databases "root/internal/infras/db"
	"root/internal/infras/repository"
	"root/internal/infras/socket"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func InitSocket(app *fiber.App) {

	userRepo := repository.NewUserRepo(databases.UserDB)
	userUseCase := usecases.NewUserUseCases(userRepo)
	friendRepo := repository.NewFriendRepo(databases.UserDB)
	friendUseCase := usecases.NewFriendUseCases(friendRepo)
	convoRepo := repository.NewConvoRepo(databases.MessageDB, databases.UserDB)
	convoUseCase := usecases.NewConvoUseCases(convoRepo)

	socket := socket.NewSocket(app)
	socketHandler := controllers.NewChatSocketControllers(userUseCase, friendUseCase, convoUseCase, socket)

	socket.Use(middleware.JWTAuth(userUseCase))
	socket.Connect(func(c *websocket.Conn) func(*websocket.Conn) {
		socketHandler.RegisterUser(c)
		return socketHandler.UnregisterUser
	}, websocket.Config{
		ReadBufferSize:  25 * 1e6,
		WriteBufferSize: 25 * 1e6,
	})
	socket.On("chat message", socketHandler.ChatMessage)
	socket.On("request", socketHandler.RequestFriend)
	socket.On("accept", socketHandler.AcceptFriendRequest)
	socket.On("reject", socketHandler.RejectFriendRequest)
	socket.On("remove request", socketHandler.RemoveFriendRequest)
	socket.On("create convo", socketHandler.CreateConvo)
	socket.On("remove convo", socketHandler.RemoveConvo)
	socket.On("unfriend", socketHandler.Unfriend)
}
