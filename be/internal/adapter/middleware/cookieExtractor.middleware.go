package middleware

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JWTExtractor() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := c.Cookies("token")
		if tokenStr == "" {
			c.Next()
		} else {
			token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
				}
				return []byte(os.Getenv("SECRET_KEY")), nil
			})
			if err != nil {
				return c.Status(401).SendString("No user found")
			}
			if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
				c.Locals("id", claims["id"].(string))
			} else {
				return c.Status(401).SendString("No user found")
			}
		}
		return c.Next()
	}
}
