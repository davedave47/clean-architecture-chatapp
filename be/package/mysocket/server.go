package mysocket

import (
	"fmt"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type Server struct {
	sockets map[string]*Socket
	mutex   *sync.RWMutex
	app     *fiber.App
	config  *websocket.Config
}

type Config struct {
	websocket.Config
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

func (sv *Server) Listen(address string) error {
	return sv.app.Listen(address)
}
