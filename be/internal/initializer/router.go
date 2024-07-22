package initializer

import (
	"os"
	"root/internal/infras/router"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func InitRouter() *fiber.App {
	r := fiber.New(fiber.Config{
		BodyLimit: 1024 * 1024 * 25,
	})
	r.Use(cors.New(cors.Config{
		AllowOrigins:     os.Getenv("FRONTEND_URL") + ", http://localhost:5173",
		AllowCredentials: true,
	}))
	//Default middlewares
	r.Use(logger.New(logger.Config{
		Format: "${time} ${method} ${path} - ${ip} - ${status} - ${latency}\n",
	}))
	return router.NewRouter(r)
}
