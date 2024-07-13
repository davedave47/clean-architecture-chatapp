package socket

import (
	"encoding/json"
	"fmt"
	"root/internal/adapter/middleware"
	"root/internal/domain/entities"
	"root/internal/domain/usecases"
	databases "root/internal/infras/db"
	"root/internal/infras/repository"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type Message struct {
	Event string `json:"event"`
	Data  any    `json:"data"`
}

var (
	connections = make(map[string][]*websocket.Conn)
	mutex       = &sync.Mutex{}
)

func unRegisterUser(user *entities.User, c *websocket.Conn, friendUseCase *usecases.FriendUseCases) {
	friends, err := friendUseCase.GetFriends(user.ID)
	if err != nil {
		panic(err)
	}
	for _, friend := range friends {
		mutex.Lock()
		if conns, ok := connections[friend.ID]; ok {
			for _, conn := range conns {
				conn.WriteJSON(Message{
					Event: "user logged out",
					Data:  *user,
				})
			}
		}
		mutex.Unlock()
	}
	mutex.Lock()
	if len(connections[user.ID]) == 1 {
		delete(connections, user.ID)
	} else {
		for i, conn := range connections[user.ID] {

			if conn == c {
				connections[user.ID] = append(connections[user.ID][:i], connections[user.ID][i+1:]...)
				break
			}
		}
	}
	mutex.Unlock()
	fmt.Println(user.Username, "disconnected")
	c.Close()
}

func InitSocket(app *fiber.App) {

	userRepo := repository.NewUserRepo(databases.UserDB)
	userUseCase := usecases.NewUserUseCases(userRepo)

	friendRepo := repository.NewFriendRepo(databases.UserDB)
	friendUseCase := usecases.NewFriendUseCases(friendRepo)

	convoRepo := repository.NewConvoRepo(databases.MessageDB, databases.UserDB)
	convoUseCase := usecases.NewConvoUseCases(convoRepo)

	app.Use("/ws", middleware.JWTAuth(userUseCase), func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {

		user := c.Locals("user").(*entities.User)

		mutex.Lock()
		connections[user.ID] = append(connections[user.ID], c)
		fmt.Println(user.Username, "connected")
		mutex.Unlock()

		friends, err := friendUseCase.GetFriends(user.ID)

		if err != nil {
			unRegisterUser(user, c, nil)
			return
		}

		onlineFriends := make([]entities.User, 0)

		for _, friend := range friends {
			mutex.Lock()
			if conns, ok := connections[friend.ID]; ok {
				// This friend is online; add to the list of online friends
				onlineFriends = append(onlineFriends, friend)
				// Notify this friend that the user has logged on
				for _, conn := range conns {
					conn.WriteJSON(Message{
						Event: "user logged on",
						Data:  *user,
					})
				}
			}
			mutex.Unlock()
		}

		fmt.Println("Online friends:", onlineFriends)

		c.WriteJSON(Message{
			Event: "online",
			Data:  onlineFriends,
		})

		defer unRegisterUser(user, c, friendUseCase)

		var message Message

		for {
			err := c.ReadJSON(&message)
			if err != nil {
				break
			}
			switch message.Event {
			case "chat message":
				var data entities.Message
				jsonData, err := json.Marshal(message.Data)
				if err != nil {
					fmt.Println("Error marshaling message.Data:", err)
					continue
				}
				err = json.Unmarshal(jsonData, &data)
				if err != nil {
					fmt.Println("Error unmarshaling message.Data:", err)
					continue
				}
				participants, err := convoRepo.GetParticipants(data.ConversationID)
				if err != nil {
					fmt.Println("Error getting participants:", err)
					continue
				}
				if data.Content.File {
					for _, file := range data.Content.Files {
						path, err := convoUseCase.UploadFile(file.FileName, file.Buffer)
						if err != nil {
							fmt.Println("Error uploading", err)
						}
						message, err := convoUseCase.SendMessage(user.ID, data.ConversationID, entities.Content{
							Text: path,
							File: true,
						}, data.CreatedAt)
						if err != nil {
							fmt.Println("Error sending message", err)
							continue
						}
						for _, participant := range participants {
							mutex.Lock()
							if conns, ok := connections[participant.ID]; ok {
								for _, conn := range conns {
									conn.WriteJSON(Message{
										Event: "chat message",
										Data:  message,
									})
								}
							}
							mutex.Unlock()
						}
					}
				} else {
					message, err := convoUseCase.SendMessage(user.ID, data.ConversationID, entities.Content{
						Text: data.Content.Text,
						File: false,
					}, data.CreatedAt)
					if err != nil {
						fmt.Println("Error sending message", err)
						continue
					}
					for _, participant := range participants {
						mutex.Lock()
						if conns, ok := connections[participant.ID]; ok {
							for _, conn := range conns {
								conn.WriteJSON(Message{
									Event: "chat message",
									Data:  message,
								})
							}
						}
						mutex.Unlock()

					}
				}
			case "request":
				friendId, ok := message.Data.(string)
				if !ok {
					fmt.Println("Error asserting message.Data to string")
					continue
				}
				err := friendUseCase.RequestFriend(user.ID, friendId)
				if err != nil {
					fmt.Println("Error requesting friend", err)
				}
				mutex.Lock()
				if conns, ok := connections[friendId]; ok {
					for _, conn := range conns {
						conn.WriteJSON(Message{
							Event: "friend request",
							Data:  user,
						})
					}
				}
				mutex.Unlock()
			case "accept":
				friendId, ok := message.Data.(string)
				if !ok {
					fmt.Println("Error asserting message.Data to string")
					continue
				}
				err := friendUseCase.AcceptFriendRequest(user.ID, friendId)
				if err != nil {
					fmt.Println("Error accepting friend", err)
					continue
				}
				mutex.Lock()
				if conns, ok := connections[friendId]; ok {
					for _, conn := range conns {
						conn.WriteJSON(Message{
							Event: "friend accepted",
							Data:  user,
						})
						friend, err := userUseCase.GetUserById(friendId)
						if err != nil {
							fmt.Println("Error getting friend", err)
							continue
						}
						conn.WriteJSON(Message{
							Event: "user logged on",
							Data:  *friend,
						})
					}
				}
				mutex.Unlock()
			case "reject":
				friendId, ok := message.Data.(string)
				if !ok {
					fmt.Println("Error asserting message.Data to string")
					continue
				}
				err := friendUseCase.RejectFriendRequest(user.ID, friendId)
				if err != nil {
					fmt.Println("Error rejecting friend", err)
				}
				mutex.Lock()
				if conns, ok := connections[friendId]; ok {
					for _, conn := range conns {
						conn.WriteJSON(Message{
							Event: "friend rejected",
							Data:  *user,
						})
					}
				}
				mutex.Unlock()
			case "remove request":
				friendId, ok := message.Data.(string)
				if !ok {
					fmt.Println("Error asserting message.Data to string")
					continue
				}
				err := friendUseCase.RemoveFriendRequest(user.ID, friendId)
				if err != nil {
					fmt.Println("Error removing friend", err)
				}
				mutex.Lock()
				if conns, ok := connections[friendId]; ok {
					for _, conn := range conns {
						conn.WriteJSON(Message{
							Event: "friend removed",
							Data:  *user,
						})
					}
				}
				mutex.Unlock()
			case "create convo":
				jsonData, err := json.Marshal(message.Data)
				participants := make([]entities.User, 0)
				if err != nil {
					fmt.Println("Error marshaling message.Data", err)
					continue
				}
				err = json.Unmarshal(jsonData, &participants)
				if err != nil {
					fmt.Println("Error unmarshaling message.Data", err)
					continue
				}
				participants = append(participants, *user)
				convo, err := convoUseCase.CreateConvo(participants)
				if err != nil {
					fmt.Println("Error creating conversation", err)
					continue
				}
				for _, participant := range participants {
					mutex.Lock()
					if conns, ok := connections[participant.ID]; ok {
						for _, conn := range conns {
							conn.WriteJSON(Message{
								Event: "convo",
								Data:  convo,
							})
						}
					}
					mutex.Unlock()
				}
			case "remove convo":
				convoId, ok := message.Data.(string)
				if !ok {
					fmt.Println("Error asserting message.Data to string")
					continue
				}
				participants, err := convoRepo.GetParticipants(convoId)
				if err != nil {
					fmt.Println("Error getting participants", err)
					continue

				}
				err = convoUseCase.DeleteConversation(convoId)
				if err != nil {
					fmt.Println("Error removing conversation", err)
					continue
				}
				for _, participant := range participants {
					mutex.Lock()
					if conns, ok := connections[participant.ID]; ok {
						for _, conn := range conns {
							conn.WriteJSON(Message{
								Event: "convo removed",
								Data:  convoId,
							})
						}
					}
					mutex.Unlock()
				}
			case "unfriend":
				friendId, ok := message.Data.(string)
				if !ok {
					fmt.Println("Error asserting message.Data to string")
					continue
				}
				err := friendUseCase.DeleteFriend(user.ID, friendId)
				if err != nil {
					fmt.Println("Error unfriending", err)
				}
				mutex.Lock()
				if conns, ok := connections[friendId]; ok {
					for _, conn := range conns {
						conn.WriteJSON(Message{
							Event: "unfriended",
							Data:  *user,
						})
					}
				}
				mutex.Unlock()
			}
		}
	}, websocket.Config{
		ReadBufferSize:  25 * 1e6,
		WriteBufferSize: 25 * 1e6,
	}))
}
