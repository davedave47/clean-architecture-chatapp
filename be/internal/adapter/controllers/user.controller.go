package controllers

import (
	"root/internal/domain/entities"
	"root/internal/domain/usecases"

	"github.com/gofiber/fiber/v2"
)

type UserControllers struct {
	userUsecase *usecases.UserUseCases
}

func NewUserControllers(userUsecase *usecases.UserUseCases) *UserControllers {
	return &UserControllers{userUsecase: userUsecase}
}

func (controllers *UserControllers) GetUserByName(c *fiber.Ctx) error {
	name := c.Query("name")
	users, err := controllers.userUsecase.GetUserByName(name)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	return c.Status(200).JSON(users)
}

func (controllers *UserControllers) GetUserById(c *fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		return c.Status(500).SendString("ID not found")
	}

	user, err := controllers.userUsecase.GetUserById(id)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	return c.Status(200).JSON(user)
}

func (controllers *UserControllers) GetAllUsers(c *fiber.Ctx) error {
	users, err := controllers.userUsecase.GetAllUsers()
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	return c.Status(200).JSON(users)
}

func (controllers *UserControllers) UpdateUser(c *fiber.Ctx) error {
	var user entities.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(400).SendString(err.Error())
	}
	id := user.ID
	changes := entities.UserChanges{
		Email:    user.Email,
		Username: user.Username,
	}
	newUser, err := controllers.userUsecase.UpdateUser(id, &changes)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	return c.Status(200).JSON(newUser)
}

func (controllers *UserControllers) UpdatePassword(c *fiber.Ctx) error {
	var body struct {
		ID       string `json:"id"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).SendString(err.Error())
	}
	newUser, err := controllers.userUsecase.UpdatePassword(body.ID, body.Password)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	return c.Status(200).JSON(newUser)
}

func (controllers *UserControllers) DeleteUser(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(*entities.User)
	if !ok {
		return c.Status(500).SendString("User not found")
	}
	err := controllers.userUsecase.DeleteUser(user.ID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}
	return c.Status(200).SendString("User deleted")
}
