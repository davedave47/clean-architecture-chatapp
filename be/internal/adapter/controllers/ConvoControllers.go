package controllers

import (
	"fmt"
	"root/internal/domain/entities"
	"root/internal/domain/usecases"
	"time"

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

func (controllers *ConvoControllers) UploadFile(c *fiber.Ctx) error {
	form, err := c.MultipartForm()
	files := form.File["files"] // Assuming "files" is the name of the form field
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	var filePaths []string
	for _, file := range files {
		modifiedName := fmt.Sprintf("%s-%d", file.Filename, time.Now().UnixNano())
		filePath := fmt.Sprintf("./uploads/%s", modifiedName)
		if err := c.SaveFile(file, filePath); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		filePaths = append(filePaths, modifiedName)
	}
	return c.JSON(filePaths)
}
