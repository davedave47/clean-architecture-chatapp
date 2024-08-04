package router

import (
	"root/internal/adapter/controllers"
	"root/internal/adapter/middleware"
	"root/internal/domain/usecases"
	"root/internal/infras/databases"
	"root/internal/infras/repository"

	"github.com/gofiber/fiber/v2"
)

func initUserRouter(api *fiber.Router) {
	user := (*api).Group("/user")
	userUseCase := usecases.NewUserUseCases(repository.NewUserRepo(databases.UserDB))

	//controllers + middlewares
	userController := controllers.NewUserControllers(userUseCase)
	JWTAuth := middleware.JWTAuth(userUseCase)
	IsAdmin := middleware.IsAdmin()
	JWTExtractor := middleware.JWTExtractor()
	EmailValidor := middleware.EmailValidator()

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
	user.Put("/update", JWTAuth, func(c *fiber.Ctx) error {
		var changes struct {
			Email    string `json:"email"`
			Username string `json:"username"`
		}
		if c.BodyParser(&changes) != nil {
			return c.Status(400).JSON(fiber.Map{"message": "Invalid request"})
		}
		if changes.Email != "" {
			if EmailValidor(c) != nil {
				return c.Status(400).JSON(fiber.Map{"message": "Invalid email"})
			}
		}
		return c.Next()
	}, userController.UpdateUser)
	user.Put("/changepassword", JWTAuth, userController.UpdatePassword)
	user.Delete("/delete", JWTAuth, userController.DeleteUser)
}
