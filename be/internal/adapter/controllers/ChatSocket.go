package controllers

import (
	"encoding/json"
	"fmt"
	"root/internal/domain/entities"
	"root/internal/domain/usecases"
	"root/package/mysocket"
)

type ChatSocketControllers struct {
	userUseCase   *usecases.UserUseCases
	friendUseCase *usecases.FriendUseCases
	convoUseCase  *usecases.ConvoUseCases
}

func NewChatSocketControllers(userUseCase *usecases.UserUseCases, friendUseCase *usecases.FriendUseCases, convoUseCase *usecases.ConvoUseCases) *ChatSocketControllers {
	return &ChatSocketControllers{userUseCase: userUseCase, friendUseCase: friendUseCase, convoUseCase: convoUseCase}
}
func (controllers *ChatSocketControllers) UnregisterUser(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friends, err := controllers.friendUseCase.GetFriends(user.ID)

	if err != nil {
		return err
	}

	for _, friend := range friends {
		err := socket.EmitMessageTo(friend.ID, "user logged out", user)
		if err != nil {
			return err
		}
	}
	fmt.Println(user.Username, "disconnected")
	return nil
}
func (controllers *ChatSocketControllers) RegisterUser(socket *mysocket.Socket, data any) error {

	user := socket.Locals("user").(*entities.User)

	fmt.Println(user.Username, "connected")

	friends, err := controllers.friendUseCase.GetFriends(user.ID)

	if err != nil {
		return err
	}

	onlineFriends := make([]entities.User, 0)

	for _, friend := range friends {
		err := socket.EmitMessageTo(friend.ID, "user logged on", user)
		if err != nil {
			continue
		}
		onlineFriends = append(onlineFriends, friend)
	}

	fmt.Println("Online friends:", onlineFriends)

	socket.EmitMessage("online", onlineFriends)
	return nil
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
	// if message.Content.File {
	// 	for _, file := range message.Content.Files {
	// 		path, err := controllers.convoUseCase.UploadFile(file.FileName, file.Buffer)
	// 		if err != nil {
	// 			return err
	// 		}
	// 		message, err := controllers.convoUseCase.SendMessage(user.ID, message.ConversationID, entities.Content{
	// 			Text: path,
	// 			File: true,
	// 		}, message.CreatedAt)
	// 		if err != nil {
	// 			return err
	// 		}
	// 		for _, participant := range participants {
	// 			controllers.socket.EmitMessage("chat message", message, participant.ID)
	// 		}
	// 	}
	// } else {
	received, err := controllers.convoUseCase.SendMessage(user.ID, message.ConversationID, entities.Content{
		Text: message.Content.Text,
		File: message.Content.File,
	}, message.CreatedAt)
	if err != nil {
		return err
	}
	for _, participant := range participants {
		socket.EmitMessageTo(participant.ID, "chat message", received)
	}
	// }
	return nil
}

func (controllers *ChatSocketControllers) RequestFriend(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friendId, ok := data.(string)
	if !ok {
		return fmt.Errorf("error asserting data to string")
	}
	err := controllers.friendUseCase.RequestFriend(user.ID, friendId)
	if err != nil {
		return err
	}
	socket.EmitMessageTo(friendId, "friend request", user)
	return nil
}

func (controllers *ChatSocketControllers) AcceptFriendRequest(socket *mysocket.Socket, data any) error {
	user := socket.Locals("user").(*entities.User)
	friendId, ok := data.(string)
	if !ok {
		return fmt.Errorf("error asserting data to string")
	}
	err := controllers.friendUseCase.AcceptFriendRequest(user.ID, friendId)
	if err != nil {
		return err
	}
	err = socket.EmitMessageTo(friendId, "friend accepted", user)
	if err == nil {
		friend, err := controllers.userUseCase.GetUserById(friendId)
		if err != nil {
			return err
		}
		socket.EmitMessageTo(user.ID, "user logged on", friend)
	}
	return nil
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
	socket.EmitMessageTo(friendId, "friend rejected", user)
	return nil
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
	socket.EmitMessageTo(friendId, "friend removed", user)
	return nil
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
		socket.EmitMessageTo(participant.ID, "convo", convo)
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
		socket.EmitMessageTo(participant.ID, "convo removed", convoId)
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
	socket.EmitMessageTo(friendId, "unfriended", user)
	return nil
}
