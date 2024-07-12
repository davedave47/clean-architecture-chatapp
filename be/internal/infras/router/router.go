package router

import (
	"root/internal/adapter/controllers"
	"root/internal/adapter/middleware"
	"root/internal/domain/usecases"
	databases "root/internal/infras/db"
	"root/internal/infras/repository"

	"github.com/gofiber/fiber/v2"
)

// NewRouter creates a new router
func NewRouter(app *fiber.App) *fiber.App {
	api := app.Group("/api")
	initAuthRoutes(&api)
	initUserRouter(&api)
	return app
}

func initUserRouter(api *fiber.Router) {
	user := (*api).Group("/user")
	userUseCase := usecases.NewUserUseCases(repository.NewUserRepo(databases.UserDB))

	//controllers + middlewares
	userController := controllers.NewUserControllers(userUseCase)
	JWTAuth := middleware.JWTAuth(userUseCase)
	IsAdmin := middleware.IsAdmin()
	JWTExtractor := middleware.JWTExtractor()
	//routes
	user.Get("/", func(c *fiber.Ctx) error {
		if c.Query("name") == "" {
			return JWTExtractor(c)
		}
		return c.Next()
	}, func(c *fiber.Ctx) error {
		if c.Query("name") != "" {
			return userController.GetUserByName(c)
		} else {
			return userController.GetUserById(c)
		}
	})
	user.Get("/users", JWTAuth, IsAdmin, userController.GetAllUsers)
	user.Put("/update", JWTAuth, userController.UpdateUser)
	user.Put("/changepassword", JWTAuth, userController.UpdatePassword)
	user.Delete("/delete", JWTAuth, userController.DeleteUser)
}
func initAuthRoutes(api *fiber.Router) {

	userRepo := repository.NewUserRepo(databases.UserDB)
	authUseCase := usecases.NewAuthUseCases(userRepo)
	userUseCase := usecases.NewUserUseCases(userRepo)

	authMiddleware := middleware.JWTAuth(userUseCase)
	authController := controllers.NewAuthControllers(authUseCase)

	(*api).Post("/login", authController.Login)
	(*api).Post("/register", authController.Register)
	(*api).Post("/logout", authMiddleware, authController.Logout)
}
