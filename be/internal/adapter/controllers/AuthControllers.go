package controllers

import (
	"root/internal/domain/usecases"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AuthControllers struct {
	authUsecase *usecases.AuthUseCases
}

func NewAuthControllers(authUsecase *usecases.AuthUseCases) *AuthControllers {
	return &AuthControllers{authUsecase: authUsecase}
}

func (controllers *AuthControllers) Login(c *fiber.Ctx) error {
	var requestBody struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(500).SendString(err.Error())
	}
	token, err := controllers.authUsecase.Login(requestBody.Email, requestBody.Password)
	if err != nil {
		if err.Error() == "Result contains no more records" || err.Error() == "crypto/bcrypt: hashedPassword is not the hash of the given password" {
			return c.Status(401).SendString("Invalid password or email")
		}
		return c.Status(500).SendString(err.Error())
	}
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(1 * time.Hour),
		SameSite: "Lax",
		HTTPOnly: true,
	})
	return c.Status(200).SendString("Login success")
}

func (controllers *AuthControllers) Register(c *fiber.Ctx) error {
	var requestBody struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&requestBody); err != nil {
		return c.Status(500).SendString(err.Error())
	}

	token, err := controllers.authUsecase.CreateUser(requestBody.Name, requestBody.Email, requestBody.Password)
	if err != nil {
		if strings.Contains(err.Error(), "already exists with label `User` and property `email` =") {
			return c.Status(400).SendString("email already exists")
		}
		if strings.Contains(err.Error(), "already exists with label `User` and property `name` =") {
			return c.Status(400).SendString("name already exists")
		}
		return c.Status(500).SendString(err.Error())
	}
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(1 * time.Hour),
		SameSite: "Lax",
		HTTPOnly: true,
	})
	return c.Status(200).SendString("Login success")
}

func (controllers *AuthControllers) Logout(c *fiber.Ctx) error {
	c.ClearCookie("token")
	return c.Status(200).SendString("Logout success")
}
