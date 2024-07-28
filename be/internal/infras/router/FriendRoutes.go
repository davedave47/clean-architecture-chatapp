package router

import (
	"root/internal/adapter/controllers"
	"root/internal/adapter/middleware"
	"root/internal/domain/usecases"
	databases "root/internal/infras/db"
	"root/internal/infras/repository"

	"github.com/gofiber/fiber/v2"
)

func initFriendRoutes(api *fiber.Router) {
	friend := (*api).Group("/friend")

	userRepo := repository.NewUserRepo(databases.UserDB)
	userUseCase := usecases.NewUserUseCases(userRepo)

	friendRepo := repository.NewFriendRepo(databases.UserDB)
	friendUseCase := usecases.NewFriendUseCases(friendRepo)

	friendController := controllers.NewFriendControllers(friendUseCase)

	JWTAuth := middleware.JWTAuth(userUseCase)
	friend.Get("/", JWTAuth, friendController.GetFriends)
	friend.Get("/requests", JWTAuth, friendController.GetRequests)
}
