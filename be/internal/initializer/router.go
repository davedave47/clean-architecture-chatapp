package initializer

import (
	"root/internal/infras/router"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func InitRouter() *fiber.App {
	r := fiber.New()

	//Default middlewares
	r.Use(logger.New(logger.Config{
		Format: "${time} ${method} ${path} - ${ip} - ${status} - ${latency}\n",
	}))
	router.NewRouter(r)
	return r
}
