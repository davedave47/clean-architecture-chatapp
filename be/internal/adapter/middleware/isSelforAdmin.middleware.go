package middleware

import (
	"root/config"
	"root/internal/domain/entities"
	"root/internal/domain/usecases"

	"github.com/gofiber/fiber/v2"
)

func IsSelforAdmin(userUsecase *usecases.UserUseCases) fiber.Handler {
	return func(c *fiber.Ctx) error {
		//Check if authorized
		user, ok := c.Locals("user").(*entities.User)
		if !ok {
			return c.Status(401).SendString("Unauthorized")
		}

		//Check if user is admin
		isAdmin := user.ID == config.Config.Server.Auth.AdminID
		if isAdmin {
			//Pasring request body
			var requestBody struct {
				ID       string `json:"id"`
				Email    string `json:"email"`
				Username string `json:"username"`
			}

			if err := c.BodyParser(&requestBody); err != nil {
				return c.Status(400).SendString(err.Error())
			}
			//Check if ID is provided
			if requestBody.ID != "" {
				user, err := userUsecase.GetUserById(requestBody.ID)
				if err != nil {
					return c.Status(500).SendString(err.Error())
				}
				c.Locals("user", user)
			} else {
				if requestBody.ID != user.ID {
					return c.Status(400).SendString("ID not found")
				}
			}
		}
		return c.Next()
	}
}
