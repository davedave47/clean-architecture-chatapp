package controllers

import (
	"fmt"
	"os"
	"root/internal/domain/entities"
	"root/internal/domain/usecases"

	"github.com/gofiber/fiber/v2"
)

type ConvoControllers struct {
	convoUsecase *usecases.ConvoUseCases
}

func NewConvoControllers(convoUsecase *usecases.ConvoUseCases) *ConvoControllers {
	return &ConvoControllers{convoUsecase: convoUsecase}
}

func (controller *ConvoControllers) GetConversations(c *fiber.Ctx) error {
	user := c.Locals("user").(*entities.User)
	skip := c.QueryInt("skip")
	// Convert skip from string to int

	conversations, err := controller.convoUsecase.GetConversations(user.ID, skip)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(conversations)
}

func (controller *ConvoControllers) GetMessages(c *fiber.Ctx) error {
	var body struct {
		ConversationId string `json:"conversationId"`
		Amount         int    `json:"amount"`
		Skip           int    `json:"skip"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	messages, err := controller.convoUsecase.GetMessages(body.ConversationId, body.Amount, body.Skip)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(messages)
}

func (controller *ConvoControllers) GetFile(c *fiber.Ctx) error {
	// Extract the filename from the URL parameter
	filename := c.Params("filename")

	// Create the path to the file
	filePath := fmt.Sprintf("./uploads/%s", filename)

	// Check if the file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		// File does not exist
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "File not found"})
	}

	// Serve the file
	return c.SendFile(filePath)
}
