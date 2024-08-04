package controllers

import (
	"encoding/json"
	"fmt"
	"root/internal/domain/entities"
	"root/internal/domain/usecases"
	"root/internal/infras/databases"
	"root/pkg/mysocket"
)

type ChatSocketControllers struct {
	userUseCase   *usecases.UserUseCases
	friendUseCase *usecases.FriendUseCases
	convoUseCase  *usecases.ConvoUseCases
}

func NewChatSocketControllers(userUseCase *usecases.UserUseCases, friendUseCase *usecases.FriendUseCases, convoUseCase *usecases.ConvoUseCases) *ChatSocketControllers {
	return &ChatSocketControllers{userUseCase: userUseCase, friendUseCase: friendUseCase, convoUseCase: convoUseCase}
}

func ConvertDataToUser(data any) (*entities.User, error) {
	dataMap, ok := data.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("error asserting data to user")
	}

	// Create a new entities.User and fill it with data from the map
	return &entities.User{
		Email:    dataMap["email"].(string),    // Assuming Email is a string
		ID:       dataMap["id"].(string),       // Assuming ID is a string
		Username: dataMap["username"].(string), // Assuming Username is a string
	}, nil
}

func EmitToUser(socket *mysocket.Socket, userId string, event string, data any) error {
	socketIds, err := databases.SocketDB.SMembers(userId)
	if err != nil {
		return err
	}
	for _, socketId := range socketIds {
		err = socket.To(socketId).EmitMessage(event, data)
		if err != nil {
			return err
		}
	}
	return nil
}

func (controllers *ChatSocketControllers) UnregisterUser(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friends, err := controllers.friendUseCase.GetFriends(user.ID)

	if err != nil {
		return err
	}

	for _, friend := range friends {
		err := EmitToUser(socket, friend.ID, "user logged out", user)
		if err != nil {
			return err
		}
	}
	databases.SocketDB.Del(user.ID)
	fmt.Println(user.Username, "disconnected")
	return nil
}
func (controllers *ChatSocketControllers) RegisterUser(socket *mysocket.Socket, data any) error {

	user := socket.Locals("user").(*entities.User)

	fmt.Println(user.Username, "connected")

	err := databases.SocketDB.SAdd(user.ID, socket.ID)
	if err != nil {
		return err
	}

	friends, err := controllers.friendUseCase.GetFriends(user.ID)

	if err != nil {
		return err
	}

	onlineFriends := make([]entities.User, 0)

	for _, friend := range friends {
		err := EmitToUser(socket, friend.ID, "user logged on", user)
		if err != nil {
			continue
		}
		connections, err := databases.SocketDB.SCard(friend.ID)
		if err != nil {
			continue
		}
		if connections > 0 {
			onlineFriends = append(onlineFriends, *friend)
		}
	}

	fmt.Println("Online friends:", onlineFriends)

	return socket.EmitMessage("online", onlineFriends)
}
func (controllers *ChatSocketControllers) ChatMessage(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)

	var message entities.Message
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	err = json.Unmarshal(jsonData, &message)
	if err != nil {
		return err
	}
	participants, err := controllers.convoUseCase.GetParticipants(message.ConversationID)
	if err != nil {
		return err
	}

	received, err := controllers.convoUseCase.SendMessage(user.ID, message.ConversationID, entities.Content{
		Text: message.Content.Text,
		File: message.Content.File,
	}, message.CreatedAt)
	if err != nil {
		return err
	}
	for _, participant := range participants {
		err := EmitToUser(socket, participant.ID, "chat message", received)
		if err != nil {
			return err
		}
	}
	return nil
}

func (controllers *ChatSocketControllers) RequestFriend(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friend, err := ConvertDataToUser(data)
	if err != nil {
		return err
	}
	err = controllers.friendUseCase.RequestFriend(user.ID, friend.ID)
	if err != nil {
		return err
	}
	EmitToUser(socket, user.ID, "request", friend)
	return EmitToUser(socket, friend.ID, "friend request", user)
}

func (controllers *ChatSocketControllers) AcceptFriendRequest(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friend, err := ConvertDataToUser(data)
	if err != nil {
		return err

	}
	err = controllers.friendUseCase.AcceptFriendRequest(user.ID, friend.ID)
	if err != nil {
		return err
	}
	conn, err := databases.SocketDB.SCard(friend.ID)
	if err != nil {
		return err
	}
	EmitToUser(socket, user.ID, "accept", friend)
	if conn > 0 {
		EmitToUser(socket, user.ID, "user logged on", friend)
	}
	return EmitToUser(socket, friend.ID, "friend accepted", user)
}

func (controllers *ChatSocketControllers) RejectFriendRequest(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friendId, ok := data.(string)
	if !ok {
		return fmt.Errorf("error asserting data to string")
	}
	err := controllers.friendUseCase.RejectFriendRequest(user.ID, friendId)
	if err != nil {
		return err
	}
	EmitToUser(socket, user.ID, "reject", entities.User{ID: friendId})
	return EmitToUser(socket, friendId, "friend rejected", user)
}

func (controllers *ChatSocketControllers) RemoveFriendRequest(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friendId, ok := data.(string)
	if !ok {
		return fmt.Errorf("error asserting data to string")
	}
	err := controllers.friendUseCase.RemoveFriendRequest(user.ID, friendId)
	if err != nil {
		return err
	}
	EmitToUser(socket, user.ID, "friend rejected", entities.User{ID: friendId})
	return EmitToUser(socket, friendId, "reject", user)
}

func (controllers *ChatSocketControllers) CreateConvo(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	participants := make([]entities.User, 0)

	err = json.Unmarshal(jsonData, &participants)
	if err != nil {
		return err
	}
	participants = append(participants, *user)
	convo, err := controllers.convoUseCase.CreateConvo(participants)
	if err != nil {
		return err
	}
	for _, participant := range participants {
		err = EmitToUser(socket, participant.ID, "convo", convo)
		if err != nil {
			return err
		}
	}
	return nil
}

func (controllers *ChatSocketControllers) RemoveConvo(socket *mysocket.Socket, data any) error {
	convoId, ok := data.(string)
	if !ok {
		return fmt.Errorf("error asserting data to string")
	}
	participants, err := controllers.convoUseCase.GetParticipants(convoId)
	if err != nil {
		return err

	}
	err = controllers.convoUseCase.DeleteConversation(convoId)
	if err != nil {
		return err
	}
	for _, participant := range participants {
		err = EmitToUser(socket, participant.ID, "convo removed", convoId)
		if err != nil {
			return err
		}
	}
	return nil
}
func (controllers *ChatSocketControllers) Unfriend(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friendId, ok := data.(string)
	if !ok {
		return fmt.Errorf("error asserting data to string")
	}
	err := controllers.friendUseCase.DeleteFriend(user.ID, friendId)
	if err != nil {
		return err
	}
	EmitToUser(socket, user.ID, "unfriended", &entities.User{ID: friendId})
	return EmitToUser(socket, friendId, "unfriended", user)
}

func (controllers *ChatSocketControllers) CallConvo(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	var callData struct {
		Conversation entities.Conversation `json:"conversation"`
		Signal       any                   `json:"signalData"`
		From         string                `json:"from"`
		Video        bool                  `json:"video"`
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	err = json.Unmarshal(jsonData, &callData)
	if err != nil {
		return err
	}
	callData.From = user.ID
	for _, participant := range callData.Conversation.Participants {
		fmt.Println("Participant:", participant.ID)
		if participant.ID != callData.From {
			err = EmitToUser(socket, participant.ID, "callFrom", callData)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func (controllers *ChatSocketControllers) AcceptCall(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	var callData struct {
		Conversation entities.Conversation `json:"conversation"`
		Signal       any                   `json:"signalData"`
		From         string                `json:"from"`
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	err = json.Unmarshal(jsonData, &callData)
	if err != nil {
		return err
	}
	callData.From = user.ID
	for _, participant := range callData.Conversation.Participants {
		err = EmitToUser(socket, participant.ID, "callAccepted", callData)
		if err != nil {
			return err
		}
	}
	return nil
}

func (controllers *ChatSocketControllers) RejectCall(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	var callData struct {
		Conversation entities.Conversation `json:"conversation"`
		From         string                `json:"from"`
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	err = json.Unmarshal(jsonData, &callData)
	if err != nil {
		return err
	}
	participants, err := controllers.convoUseCase.GetParticipants(callData.Conversation.ID)
	if err != nil {
		return err
	}
	callData.From = user.ID
	for _, participant := range participants {
		err = EmitToUser(socket, participant.ID, "callRejected", callData)
		if err != nil {
			return err
		}
	}
	return nil
}

func (controllers *ChatSocketControllers) CancelCall(socket *mysocket.Socket) {
	fmt.Println("CancelCall")
}
