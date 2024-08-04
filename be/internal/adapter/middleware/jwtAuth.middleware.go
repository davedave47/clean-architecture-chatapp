package middleware

import (
	"root/config"
	"root/internal/domain/usecases"
	"root/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

func JWTAuth(userUsecase *usecases.UserUseCases) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := c.Cookies("token")
		if tokenStr == "" {
			return c.Status(401).SendString("Unauthorized")
		}
		claims, err := utils.JWTParser(config.Config.Server.Auth.JwtSecret, tokenStr)
		if err != nil {
			return c.Status(401).SendString("Unauthorized")
		}
		user, err := userUsecase.GetUserById(claims["id"].(string))
		if err != nil {
			return c.Status(500).SendString(err.Error())
		}
		c.Locals("user", user)
		return c.Next()
	}
}
