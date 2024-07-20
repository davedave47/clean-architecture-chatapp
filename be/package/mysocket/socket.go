package mysocket

import (
	"fmt"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Message struct {
	Event string `json:"event"`
	Data  any    `json:"data"`
}
type Socket struct {
	events map[string]func(*Socket, any) error
	ID     string
	conn   *websocket.Conn
	server *Server
}
type Server struct {
	sockets map[string]*Socket
	mutex   *sync.RWMutex
	app     *fiber.App
	config  *websocket.Config
}

type Config struct {
	websocket.Config
}

func NewSocket(conn *websocket.Conn) *Socket {
	return &Socket{
		events: make(map[string]func(*Socket, any) error),
		ID:     uuid.New().String(),
		conn:   conn,
	}
}

func NewServer(r *fiber.App, config ...Config) *Server {
	if len(config) == 0 {
		return &Server{
			sockets: make(map[string]*Socket),
			mutex:   &sync.RWMutex{},
			app:     r,
		}
	}
	return &Server{
		sockets: make(map[string]*Socket),
		mutex:   &sync.RWMutex{},
		app:     r,
		config:  &config[0].Config,
	}
}

func (sv *Server) On(callback func(*Socket)) {
	sv.app.Get("/ws", websocket.New(func(c *websocket.Conn) {

		socket := NewSocket(c)
		sv.Register(socket)
		callback(socket)

		defer func() {
			if event, ok := socket.events["disconnect"]; ok {
				event(socket, nil)
			} else {
				c.Close()
			}
			sv.Unregister(socket)
		}()

		var message Message
		for {
			err := c.ReadJSON(&message)
			if err != nil {
				break
			}
			if event, ok := socket.events[message.Event]; ok {
				err = event(socket, message.Data)
				if err != nil {
					fmt.Println("Error handling event", err)
				}
			} else {
				fmt.Println("Event not found")
				continue
			}
		}
	}, *sv.config))
}

func (sv *Server) Use(handler ...fiber.Handler) {
	for _, handler := range handler {
		sv.app.Use(handler)
	}
	sv.app.Use(func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
}

func (sv *Server) Register(s *Socket) {
	sv.mutex.Lock()
	s.server = sv
	sv.sockets[s.ID] = s
	sv.mutex.Unlock()
}

func (sv *Server) Unregister(socket *Socket) {
	sv.mutex.Lock()
	delete(sv.sockets, socket.ID)
	socket.server = nil
	sv.mutex.Unlock()
}

func (sv *Server) Close() {
	sv.mutex.Lock()
	for _, socket := range sv.sockets {
		socket.conn.Close()
		delete(sv.sockets, socket.ID)
	}
	sv.mutex.Unlock()
}

func (sv *Server) Broadcast(event string, data any) {
	sv.mutex.RLock()
	for _, socket := range sv.sockets {
		socket.conn.WriteJSON(Message{
			Event: event,
			Data:  data,
		})
	}
	sv.mutex.RUnlock()
}

func (sv *Server) Listen(address string) error {
	return sv.app.Listen(address)
}

func (s *Socket) On(message string, callback func(*Socket, any) error) {
	s.events[message] = callback
}
func (s *Socket) EmitMessage(event string, data any) error {
	return s.conn.WriteJSON(Message{
		Event: event,
		Data:  data,
	})
}

func (s *Socket) EmitMessageTo(socketId string, event string, data any) error {
	sv := s.server
	sv.mutex.RLock()
	socket, ok := sv.sockets[socketId]
	sv.mutex.RUnlock()
	if !ok {
		return fmt.Errorf("socket not found")
	}
	return socket.conn.WriteJSON(Message{
		Event: event,
		Data:  data,
	})
}

func (s *Socket) Locals(key string) any {
	return s.conn.Locals(key)
}
