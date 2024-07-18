package controllers

import (
	"encoding/json"
	"fmt"
	"root/internal/domain/entities"
	"root/internal/domain/usecases"
	"root/internal/infras/socket"

	"github.com/gofiber/contrib/websocket"
)

type ChatSocketControllers struct {
	userUseCase   *usecases.UserUseCases
	friendUseCase *usecases.FriendUseCases
	convoUseCase  *usecases.ConvoUseCases
	socket        *socket.Socket
}

func NewChatSocketControllers(userUseCase *usecases.UserUseCases, friendUseCase *usecases.FriendUseCases, convoUseCase *usecases.ConvoUseCases, socket *socket.Socket) *ChatSocketControllers {
	return &ChatSocketControllers{userUseCase: userUseCase, friendUseCase: friendUseCase, convoUseCase: convoUseCase, socket: socket}
}
func (controllers *ChatSocketControllers) UnregisterUser(c *websocket.Conn) {
	user := c.Locals("user").(*entities.User)
	friends, err := controllers.friendUseCase.GetFriends(user.ID)

	if err != nil {
		panic(err)
	}

	controllers.socket.Mutex.Lock()
	delete(controllers.socket.Connections, user.ID)
	controllers.socket.Mutex.Unlock()

	for _, friend := range friends {
		err := controllers.socket.EmitMessage("user logged off", user, friend.ID)
		if err != nil {
			fmt.Println(err)
		}
	}
	fmt.Println(user.Username, "disconnected")
}
func (controllers *ChatSocketControllers) RegisterUser(c *websocket.Conn) {
	user := c.Locals("user").(*entities.User)

	controllers.socket.Mutex.Lock()
	controllers.socket.Connections[user.ID] = append(controllers.socket.Connections[user.ID], c)
	fmt.Println(user.Username, "connected")
	controllers.socket.Mutex.Unlock()

	friends, err := controllers.friendUseCase.GetFriends(user.ID)

	if err != nil {
		controllers.UnregisterUser(c)
		return
	}

	onlineFriends := make([]entities.User, 0)

	for _, friend := range friends {
		err := controllers.socket.EmitMessage("user logged on", user, friend.ID)
		if err != nil {
			fmt.Println(err)
		}
		onlineFriends = append(onlineFriends, friend)
	}

	fmt.Println("Online friends:", onlineFriends)

	c.WriteJSON(socket.Message{
		Event: "online",
		Data:  onlineFriends,
	})
}
func (controllers *ChatSocketControllers) ChatMessage(c *websocket.Conn) func(data any) error {
	user := c.Locals("user").(*entities.User)
	return func(data any) error {
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
		if message.Content.File {
			for _, file := range message.Content.Files {
				path, err := controllers.convoUseCase.UploadFile(file.FileName, file.Buffer)
				if err != nil {
					return err
				}
				message, err := controllers.convoUseCase.SendMessage(user.ID, message.ConversationID, entities.Content{
					Text: path,
					File: true,
				}, message.CreatedAt)
				if err != nil {
					return err
				}
				for _, participant := range participants {
					controllers.socket.EmitMessage("chat message", message, participant.ID)
				}
			}
		} else {
			message, err := controllers.convoUseCase.SendMessage(user.ID, message.ConversationID, entities.Content{
				Text: message.Content.Text,
				File: false,
			}, message.CreatedAt)
			if err != nil {
				return err
			}
			for _, participant := range participants {
				controllers.socket.EmitMessage("chat message", message, participant.ID)
			}
		}
		return nil
	}
}

func (controllers *ChatSocketControllers) RequestFriend(c *websocket.Conn) func(data any) error {
	user := c.Locals("user").(*entities.User)
	return func(data any) error {
		friendId, ok := data.(string)
		if !ok {
			return fmt.Errorf("error asserting data to string")
		}
		err := controllers.friendUseCase.RequestFriend(user.ID, friendId)
		if err != nil {
			return err
		}
		controllers.socket.EmitMessage("friend request", user, friendId)
		return nil
	}

}

func (controllers *ChatSocketControllers) AcceptFriendRequest(c *websocket.Conn) func(data any) error {
	user := c.Locals("user").(*entities.User)
	return func(data any) error {
		friendId, ok := data.(string)
		if !ok {
			return fmt.Errorf("error asserting data to string")
		}
		err := controllers.friendUseCase.AcceptFriendRequest(user.ID, friendId)
		if err != nil {
			return err
		}
		controllers.socket.EmitMessage("friend request accepted", user, friendId)
		return nil
	}
}

func (controllers *ChatSocketControllers) RejectFriendRequest(c *websocket.Conn) func(data any) error {
	user := c.Locals("user").(*entities.User)
	return func(data any) error {
		friendId, ok := data.(string)
		if !ok {
			return fmt.Errorf("error asserting data to string")
		}
		err := controllers.friendUseCase.RejectFriendRequest(user.ID, friendId)
		if err != nil {
			return err
		}
		controllers.socket.EmitMessage("friend rejected", user, friendId)
		return nil
	}
}

func (controllers *ChatSocketControllers) RemoveFriendRequest(c *websocket.Conn) func(data any) error {
	user := c.Locals("user").(*entities.User)
	return func(data any) error {
		friendId, ok := data.(string)
		if !ok {
			return fmt.Errorf("error asserting data to string")
		}
		err := controllers.friendUseCase.RemoveFriendRequest(user.ID, friendId)
		if err != nil {
			return err
		}
		controllers.socket.EmitMessage("friend removed", user, friendId)
		return nil
	}
}

func (controllers *ChatSocketControllers) CreateConvo(c *websocket.Conn) func(data any) error {
	user := c.Locals("user").(*entities.User)
	return func(data any) error {
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
			controllers.socket.EmitMessage("convo", convo, participant.ID)
		}
		return nil
	}
}

func (controllers *ChatSocketControllers) RemoveConvo(c *websocket.Conn) func(data any) error {
	return func(data any) error {
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
			controllers.socket.EmitMessage("convo removed", convoId, participant.ID)
		}
		return nil
	}
}
func (controllers *ChatSocketControllers) Unfriend(c *websocket.Conn) func(data any) error {
	user := c.Locals("user").(*entities.User)
	return func(data any) error {
		friendId, ok := data.(string)
		if !ok {
			return fmt.Errorf("error asserting data to string")
		}
		err := controllers.friendUseCase.DeleteFriend(user.ID, friendId)
		if err != nil {
			return err
		}
		controllers.socket.EmitMessage("unfriended", user, friendId)
		return nil
	}
}
