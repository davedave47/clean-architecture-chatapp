package router

import (
	"root/internal/adapter/controllers"
	"root/internal/adapter/middleware"
	"root/internal/domain/usecases"
	databases "root/internal/infras/db"
	"root/internal/infras/repository"

	"github.com/gofiber/fiber/v2"
)

func initAuthRoutes(api *fiber.Router) {

	userRepo := repository.NewUserRepo(databases.UserDB)
	authUseCase := usecases.NewAuthUseCases(userRepo)
	userUseCase := usecases.NewUserUseCases(userRepo)

	authMiddleware := middleware.JWTAuth(userUseCase)
	authController := controllers.NewAuthControllers(authUseCase)
	EmailValidator := middleware.EmailValidator()

	(*api).Post("/login", authController.Login)
	(*api).Post("/register", EmailValidator, authController.Register)
	(*api).Post("/logout", authMiddleware, authController.Logout)
}
