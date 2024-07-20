package socket

import (
	"root/internal/adapter/controllers"
	"root/internal/domain/usecases"
	databases "root/internal/infras/db"
	"root/internal/infras/repository"
	"root/package/mysocket"

	"github.com/gofiber/fiber/v2"
)

func NewServer(app *fiber.App) *mysocket.Server {
	server := mysocket.NewServer(app, mysocket.Config{})
	InitServer(server)
	return server
}

func InitServer(server *mysocket.Server) {
	userRepo := repository.NewUserRepo(databases.UserDB)
	userUseCase := usecases.NewUserUseCases(userRepo)
	friendRepo := repository.NewFriendRepo(databases.UserDB)
	friendUseCase := usecases.NewFriendUseCases(friendRepo)
	convoRepo := repository.NewConvoRepo(databases.MessageDB, databases.UserDB)
	convoUseCase := usecases.NewConvoUseCases(convoRepo)
	handler := controllers.NewChatSocketControllers(userUseCase, friendUseCase, convoUseCase)
	server.On(func(socket *mysocket.Socket) {
		handler.RegisterUser(socket, nil)
		InitListeners(socket, handler)
	})
}

func InitListeners(socket *mysocket.Socket, handler *controllers.ChatSocketControllers) {
	socket.On("chat message", handler.ChatMessage)
	socket.On("request", handler.RequestFriend)
	socket.On("accept", handler.AcceptFriendRequest)
	socket.On("reject", handler.RejectFriendRequest)
	socket.On("remove request", handler.RemoveFriendRequest)
	socket.On("create convo", handler.CreateConvo)
	socket.On("remove convo", handler.RemoveConvo)
	socket.On("unfriend", handler.Unfriend)
	socket.On("disconnect", handler.UnregisterUser)
}
