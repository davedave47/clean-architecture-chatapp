package socket

import (
	"root/internal/adapter/middleware"
	"root/internal/domain/entities"
	"root/internal/domain/usecases"
	databases "root/internal/infras/db"
	"root/internal/infras/repository"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func InitSocket(app *fiber.App) {

	userRepo := repository.NewUserRepo(databases.UserDB)
	userUseCase := usecases.NewUserUseCases(userRepo)

	app.Use("/ws", middleware.JWTAuth(userUseCase), func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		defer c.Close()

		user := c.Locals("user").(*entities.User)

		for {
			mt, msg, err := c.ReadMessage()
			if err != nil {
				break
			}

			err = c.WriteMessage(mt, msg)
			if err != nil {
				break
			}
		}
	}, websocket.Config{
		ReadBufferSize:  25 * 1e6,
		WriteBufferSize: 25 * 1e6,
	}))
}
