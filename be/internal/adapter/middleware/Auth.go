package middleware

import (
	"fmt"
	"os"
	"root/internal/domain/usecases"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func JWTAuth(userUsecase *usecases.UserUseCases) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenStr := c.Cookies("token")
		if tokenStr == "" {
			return c.Status(401).SendString("Unauthorized")
		}
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("SECRET_KEY")), nil
		})
		if err != nil {
			return c.Status(401).SendString("Unauthorized")
		}
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			user, err := userUsecase.GetUserById(claims["id"].(string))
			if err != nil {
				return c.Status(500).SendString(err.Error())
			}
			c.Locals("user", user)
		} else {
			return c.Status(401).SendString("Unauthorized")
		}
		return c.Next()
	}
}
