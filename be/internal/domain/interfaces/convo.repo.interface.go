package interfaces

import (
	"root/internal/domain/entities"
	"time"
)

// ConversationRepository is a repository for conversations
type ConversationRepository interface {
	GetConversations(userId string, skip int) ([]*entities.Conversation, error)
	GetTalkedToUsers(userId string) ([]*entities.User, error)
	SendMessage(senderId string, conversationId string, content entities.Content, createdAt time.Time) (*entities.Message, error)
	CreateConversation(users []entities.User) (*entities.Conversation, error)
	GetMessages(conversationId string, amount int, skip int) ([]*entities.Message, error)
	DeleteConversation(conversationId string) error
	DeleteMessage(messageId string) error
	DeleteMessages(conversationId string) error
	GetParticipants(conversationId string) ([]*entities.User, error)
	UploadFile(filename string, file []byte) (string, error)
}
