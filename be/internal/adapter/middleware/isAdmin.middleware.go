package middleware

import (
	"root/config"
	"root/internal/domain/entities"

	"github.com/gofiber/fiber/v2"
)

func IsAdmin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := c.Locals("user").(*entities.User)
		if !ok {
			return c.Status(401).SendString("Unauthorized")
		}
		if user.ID != config.Config.Server.Auth.AdminID {
			return c.Status(401).SendString("You don't have permission to access this route")
		}
		return c.Next()
	}
}
