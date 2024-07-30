package middleware

import (
	"regexp"

	"github.com/gofiber/fiber/v2"
)

func EmailValidator() fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		var req struct {
			Email string `json:"email"`
		}
		if err := ctx.BodyParser(&req); err != nil {
			return ctx.Status(400).JSON("Invalid request body")
		}
		if req.Email == "" {
			return ctx.Status(400).JSON("Email is required")
		}
		emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
		re := regexp.MustCompile(emailRegex)
		if !re.MatchString(req.Email) {
			return ctx.Status(400).JSON("Invalid email")
		}
		return ctx.Next()
	}
}
