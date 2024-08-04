package repository

import (
	"fmt"
	"os"
	"root/internal/domain/entities"
	"root/pkg/databases/mongodb"
	"root/pkg/databases/neo4j"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ConvoRepo struct {
	messageDB *mongodb.Database
	convoDB   *neo4j.Database
}

func NewConvoRepo(messageDB *mongodb.Database, convoDB *neo4j.Database) *ConvoRepo {
	return &ConvoRepo{
		messageDB: messageDB,
		convoDB:   convoDB,
	}
}
func (repo *ConvoRepo) CreateConversation(users []entities.User) (*entities.Conversation, error) {
	userIds := make([]string, len(users))
	for i, user := range users {
		userIds[i] = user.ID
	}
	records, err := repo.convoDB.Query(`CREATE (c:Conversation {id: randomUUID(), createdAt: $createdAt})
			WITH c
			UNWIND $users AS user
			MATCH (u:User {id: user})
			CREATE (c)-[:PARTICIPANT]->(u)
			WITH c, collect(u) AS users
			RETURN c`,
		map[string]interface{}{
			"users":     userIds,
			"createdAt": time.Now().Format(time.RFC3339),
		})
	if err != nil {
		return nil, err
	}
	convoNode, err := neo4j.GetNode(records[0], "c")
	if err != nil {
		return nil, err
	}
	createdAt, err := time.Parse(time.RFC3339, convoNode.Props["createdAt"].(string))
	participants := make([]*entities.User, len(users))
	for index := range users {
		participants[index] = &users[index]
	}
	return &entities.Conversation{
		ID:           convoNode.Props["id"].(string),
		CreatedAt:    createdAt,
		Participants: participants,
	}, err
}

func (repo *ConvoRepo) GetConversations(userId string, skip int) ([]*entities.Conversation, error) {
	records, err := repo.convoDB.Query(`MATCH (user:User {id: $userId})-[:PARTICIPANT]-(conversation: Conversation)
        RETURN conversation
        ORDER BY conversation.lastMessageAt DESC
        SKIP 0
        LIMIT 10`,
		map[string]interface{}{
			"userId": userId,
		})
	if err != nil {
		return nil, err
	}
	conversations := make([]*entities.Conversation, len(records))
	for index, record := range records {
		convoNode, err := neo4j.GetNode(record, "conversation")
		if err != nil {
			return nil, err
		}
		name, ok := convoNode.Props["name"].(string)
		if !ok {
			name = ""
		}
		createdAt, err := time.Parse(time.RFC3339, (convoNode.Props["createdAt"]).(string))
		if err != nil {
			return nil, err
		}
		conversations[index] = &entities.Conversation{
			ID:           convoNode.Props["id"].(string),
			Participants: []*entities.User{},
			CreatedAt:    createdAt,
			Name:         name,
		}
	}
	return conversations, nil
}
func (repo *ConvoRepo) GetTalkedToUsers(userId string) ([]*entities.User, error) {
	records, err := repo.convoDB.Query(`MATCH (u1:User {id: $userId})-[:PARTICIPANT]-(c:Conversation)-[:PARTICIPANT]-(u2:User)
			WHERE u1 <> u2
			RETURN u2 AS u`,
		map[string]interface{}{
			"userId": userId,
		})
	if err != nil {
		return nil, err
	}
	users := make([]*entities.User, len(records))
	for index, record := range records {
		users[index], err = RecordToUser(record)
		if err != nil {
			return nil, err
		}
	}
	return users, nil
}
func (repo *ConvoRepo) GetParticipants(conversationId string) ([]*entities.User, error) {
	records, err := repo.convoDB.Query(`MATCH (c:Conversation {id: $conversationId})-[:PARTICIPANT]->(u:User)
			RETURN u`,
		map[string]interface{}{
			"conversationId": conversationId,
		})
	if err != nil {
		return nil, err
	}
	users := make([]*entities.User, len(records))
	for index, record := range records {
		users[index], err = RecordToUser(record)
		if err != nil {
			return nil, err
		}
	}
	return users, nil
}
func (repo *ConvoRepo) DeleteConversation(conversationId string) error {
	_, err := repo.convoDB.Query(`MATCH (c:Conversation {id: $conversationId}) DETACH DELETE c`,
		map[string]interface{}{
			"conversationId": conversationId,
		})
	return err
}

func (repo *ConvoRepo) SendMessage(senderId string, conversationId string, content entities.Content, createdAt time.Time) (*entities.Message, error) {
	collection, ctx, cancel := repo.messageDB.GetCollection("messages")
	defer cancel()
	message := entities.Message{
		SenderID:       senderId,
		Content:        content,
		CreatedAt:      createdAt,
		ConversationID: conversationId,
	}
	result, err := collection.InsertOne(ctx, message)
	if err != nil {
		return nil, err

	}
	message.ID = result.InsertedID.(primitive.ObjectID).String()
	return &message, nil
}
func (repo *ConvoRepo) GetMessages(conversationId string, amount int, skip int) ([]*entities.Message, error) {
	collection, ctx, cancel := repo.messageDB.GetCollection("messages")
	defer cancel()
	opts := options.Find().SetSort(bson.D{primitive.E{Key: "createdAt", Value: -1}}).SetSkip(int64(skip)).SetLimit(int64(amount))
	cursor, err := collection.Find(ctx, bson.D{primitive.E{Key: "conversationId", Value: conversationId}}, opts)
	if err != nil {
		return nil, err

	}
	messages := make([]*entities.Message, 0)
	for cursor.Next(ctx) {
		var message struct {
			ID             primitive.ObjectID `bson:"_id"`
			Content        entities.Content   `bson:"content"`
			SenderID       string             `bson:"senderId"`
			ConversationID string             `bson:"conversationId"`
			CreatedAt      time.Time          `bson:"createdAt"`
		}
		err := cursor.Decode(&message)
		if err != nil {
			return nil, err

		}
		messages = append(messages, &entities.Message{
			ID:             message.ID.String(),
			Content:        message.Content,
			SenderID:       message.SenderID,
			ConversationID: message.ConversationID,
			CreatedAt:      message.CreatedAt,
		})
	}
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}
	return messages, nil
}
func (repo *ConvoRepo) DeleteMessage(messageId string) error {
	collection, ctx, cancel := repo.messageDB.GetCollection("messages")
	defer cancel()
	_, err := collection.DeleteOne(ctx, map[string]interface{}{
		"_id": messageId,
	})
	return err
}
func (repo *ConvoRepo) DeleteMessages(conversationId string) error {
	collection, ctx, cancel := repo.messageDB.GetCollection("messages")
	defer cancel()
	_, err := collection.DeleteMany(ctx, map[string]interface{}{
		"conversationId": conversationId,
	})
	return err
}
func (repo *ConvoRepo) UploadFile(filename string, file []byte) (string, error) {
	modifiedFilename := fmt.Sprintf("%s-%d", filename, time.Now().UnixNano())
	err := os.WriteFile(fmt.Sprintf("./uploads/%s", modifiedFilename), file, 0644)
	if err != nil {
		return "", err
	}
	return modifiedFilename, nil
}
