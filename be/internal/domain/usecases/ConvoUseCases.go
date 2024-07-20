package usecases

import (
	"root/internal/domain/entities"
	"root/internal/domain/interfaces"
	"sort"
	"time"
)

type ConvoUseCases struct {
	convoRepo interfaces.ConversationRepository
}

func NewConvoUseCases(convoRepo interfaces.ConversationRepository) *ConvoUseCases {
	return &ConvoUseCases{convoRepo: convoRepo}
}

func (usecases *ConvoUseCases) CreateConvo(users []entities.User) (*entities.Conversation, error) {
	return usecases.convoRepo.CreateConversation(users)
}

func (usecases *ConvoUseCases) GetConversations(userId string, skip int) ([]entities.Conversation, error) {
	conversations, err := usecases.convoRepo.GetConversations(userId, skip)
	if err != nil {
		return nil, err

	}
	for i, convo := range conversations {
		participants, err := usecases.GetParticipants(convo.ID)
		if err != nil {
			return nil, err
		}
		conversations[i].Participants = participants
		lastMessage, err := usecases.convoRepo.GetMessages(convo.ID, 1, 0)
		if err != nil {
			return nil, err

		}
		if len(lastMessage) > 0 {
			conversations[i].LastMessage = &lastMessage[0]
		}
	}
	if len(conversations) > 1 {
		sort.Slice(conversations, func(i, j int) bool {
			if conversations[i].LastMessage == nil {
				return false
			}
			return conversations[i].LastMessage.CreatedAt.After(conversations[j].LastMessage.CreatedAt)
		})
	}
	return conversations, nil
}

func (usecases *ConvoUseCases) GetTalkedToUsers(userId string) ([]entities.User, error) {
	return usecases.convoRepo.GetTalkedToUsers(userId)
}

func (usecases *ConvoUseCases) SendMessage(senderId string, conversationId string, content entities.Content, createdAt time.Time) (*entities.Message, error) {
	return usecases.convoRepo.SendMessage(senderId, conversationId, content, createdAt)
}

func (usecases *ConvoUseCases) GetMessages(conversationId string, amount int, skip int) ([]entities.Message, error) {
	return usecases.convoRepo.GetMessages(conversationId, amount, skip)
}

func (usecases *ConvoUseCases) DeleteConversation(conversationId string) error {
	return usecases.convoRepo.DeleteConversation(conversationId)
}

func (usecases *ConvoUseCases) DeleteMessage(messageId string) error {
	return usecases.convoRepo.DeleteMessage(messageId)
}

func (usecases *ConvoUseCases) GetParticipants(conversationId string) ([]entities.User, error) {
	return usecases.convoRepo.GetParticipants(conversationId)
}

func (usecases *ConvoUseCases) UploadFile(filename string, file []byte) (string, error) {
	return usecases.convoRepo.UploadFile(filename, file)
}
