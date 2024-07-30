package controllers

import (
	"root/internal/domain/entities"
	"root/internal/domain/usecases"

	"github.com/gofiber/fiber/v2"
)

type FriendControllers struct {
	friendUsecase *usecases.FriendUseCases
}

func NewFriendControllers(friendUsecase *usecases.FriendUseCases) *FriendControllers {
	return &FriendControllers{friendUsecase: friendUsecase}
}

func (controller *FriendControllers) GetFriends(c *fiber.Ctx) error {
	user := c.Locals("user").(*entities.User)
	friends, err := controller.friendUsecase.GetFriends(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(friends)
}

func (controller *FriendControllers) GetRequests(c *fiber.Ctx) error {
	user := c.Locals("user").(*entities.User)
	received, err := controller.friendUsecase.GetReceivedFriendRequests(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	sent, err := controller.friendUsecase.GetSentFriendRequests(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})

	}
	return c.JSON(fiber.Map{
		"received": received,
		"sent":     sent,
	})
}
