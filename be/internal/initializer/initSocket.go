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
	InitListeners(socket, socketHandler)
}

func InitListeners(socket *socket.Socket, handler *controllers.ChatSocketControllers) {
	socket.On("chat message", handler.ChatMessage)
	socket.On("request", handler.RequestFriend)
	socket.On("accept", handler.AcceptFriendRequest)
	socket.On("reject", handler.RejectFriendRequest)
	socket.On("remove request", handler.RemoveFriendRequest)
	socket.On("create convo", handler.CreateConvo)
	socket.On("remove convo", handler.RemoveConvo)
	socket.On("unfriend", handler.Unfriend)
}
