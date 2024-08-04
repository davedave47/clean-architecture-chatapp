package router

import (
	"root/internal/adapter/controllers"
	"root/internal/adapter/middleware"
	"root/internal/domain/usecases"
	"root/internal/infras/databases"
	"root/internal/infras/repository"

	"github.com/gofiber/fiber/v2"
)

func initConvoRoutes(api *fiber.Router) {
	convo := (*api).Group("/conversation")

	userRepo := repository.NewUserRepo(databases.UserDB)
	userUseCase := usecases.NewUserUseCases(userRepo)
	convoRepo := repository.NewConvoRepo(databases.MessageDB, databases.UserDB)
	convoUseCase := usecases.NewConvoUseCases(convoRepo)
	convoController := controllers.NewConvoControllers(convoUseCase)

	JWTAuth := middleware.JWTAuth(userUseCase)
	isSelforAdmin := middleware.IsSelforAdmin(userUseCase)
	convo.Get("/", JWTAuth, convoController.GetConversations)
	convo.Post("/messages", JWTAuth, convoController.GetMessages)
	convo.Delete("/delete", JWTAuth, isSelforAdmin, convoController.DeleteConvo)
	convo.Post("/upload", JWTAuth, convoController.UploadFile)
}
