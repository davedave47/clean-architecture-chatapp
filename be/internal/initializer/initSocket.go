package initializer

import (
	"root/internal/infras/socket"
	"root/package/mysocket"

	"github.com/gofiber/fiber/v2"
)

func InitSocket(app *fiber.App) *mysocket.Server {
	return socket.NewServer(app)
}
