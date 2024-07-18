package socket

import (
	"fmt"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type Message struct {
	Event string `json:"event"`
	Data  any    `json:"data"`
}
type Socket struct {
	Connections map[string][]*websocket.Conn
	Mutex       *sync.RWMutex
	events      map[string]func(*websocket.Conn) func(any) error
	app         *fiber.App
}

func NewSocket(r *fiber.App) *Socket {
	return &Socket{
		Connections: make(map[string][]*websocket.Conn),
		Mutex:       &sync.RWMutex{},
		events:      map[string]func(*websocket.Conn) func(data any) error{},
		app:         r,
	}
}

func (s *Socket) Use(handler ...fiber.Handler) {
	for _, handler := range handler {
		s.app.Use(handler)
	}
	s.app.Use(func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
}

func (s *Socket) Connect(connect func(*websocket.Conn) func(*websocket.Conn), config websocket.Config) {
	s.app.Get("/ws", websocket.New(func(c *websocket.Conn) {

		cleanup := connect(c)
		defer cleanup(c)

		var message Message
		for {
			err := c.ReadJSON(&message)
			if err != nil {
				break
			}
			if event, ok := s.events[message.Event]; ok {
				err = event(c)(message.Data)
				if err != nil {
					fmt.Println("Error handling event", err)
				}
			} else {
				fmt.Println("Event not found")
				continue
			}
		}
	}, config))
}

func (s *Socket) EmitMessage(event string, data any, userId string) error {
	s.Mutex.RLock()
	if conns, ok := s.Connections[userId]; ok {
		for _, conn := range conns {
			conn.WriteJSON(Message{
				Event: event,
				Data:  data,
			})
		}
	} else {
		s.Mutex.RUnlock()
		return fmt.Errorf("user %s not connected", userId)
	}
	s.Mutex.RUnlock()
	return nil
}

func (s *Socket) On(message string, callback func(*websocket.Conn) func(any) error) {
	s.events[message] = callback
}
