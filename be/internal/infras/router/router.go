package router

import (
	"fmt"
	"regexp"
	"root/internal/adapter/controllers"
	"root/internal/adapter/middleware"
	"root/internal/domain/usecases"
	databases "root/internal/infras/db"
	"root/internal/infras/repository"

	"github.com/gofiber/fiber/v2"
)

// NewRouter creates a new router
func NewRouter(app *fiber.App) *fiber.App {
	app.Static("/uploads", "../../../uploads")
	app.Get("/uploads/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		filepath := "./uploads/" + id
		re := regexp.MustCompile(`-\d+$`)
		filename := re.ReplaceAllString(id, "")
		fmt.Println(filename)
		c.Set("Content-Disposition", "attachment; filename="+filename)
		return c.SendFile(filepath, true)
	})
	api := app.Group("/api")
	initAuthRoutes(&api)
	initUserRouter(&api)
	initConvoRoutes(&api)
	initFriendRoutes(&api)
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

func initConvoRoutes(api *fiber.Router) {
	convo := (*api).Group("/conversation")

	userRepo := repository.NewUserRepo(databases.UserDB)
	userUseCase := usecases.NewUserUseCases(userRepo)
	convoRepo := repository.NewConvoRepo(databases.MessageDB, databases.UserDB)
	convoUseCase := usecases.NewConvoUseCases(convoRepo)
	convoController := controllers.NewConvoControllers(convoUseCase)

	JWTAuth := middleware.JWTAuth(userUseCase)
	convo.Get("/", JWTAuth, convoController.GetConversations)
	convo.Post("/messages", JWTAuth, convoController.GetMessages)
	convo.Post("/upload", JWTAuth, convoController.UploadFile)
}

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
