package middleware

import (
	"root/config"
	"root/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

func JWTExtractor() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := c.Cookies("token")
		if tokenStr == "" {
			c.Next()
		} else {
			claims, err := utils.JWTParser(config.Config.Server.Auth.JwtSecret, tokenStr)
			if err != nil {
				return c.Status(401).SendString("No user found")
			}
			c.Locals("id", claims["id"].(string))
		}
		return c.Next()
	}
}
