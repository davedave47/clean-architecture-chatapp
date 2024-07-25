package mysocket

import (
	"fmt"
	"strconv"
	"strings"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type Server struct {
	sockets       []*cache
	app           *fiber.App
	config        *websocket.Config
	shutdownFlag  bool
	shutdownMutex sync.RWMutex
	sync.RWMutex
}
type cache struct {
	sockets map[string]*Socket
	sync.RWMutex
}

type Config struct {
	websocket.Config
}

func NewServer(r *fiber.App, config ...Config) *Server {
	initialCache := make([]*cache, 10)
	for i := 0; i < 10; i++ {
		initialCache[i] = &cache{
			sockets: make(map[string]*Socket),
		}
	}
	if len(config) == 0 {
		return &Server{
			sockets:       initialCache,
			app:           r,
			shutdownFlag:  false,
			shutdownMutex: sync.RWMutex{},
		}
	}
	return &Server{
		sockets:       initialCache,
		app:           r,
		config:        &config[0].Config,
		shutdownFlag:  false,
		shutdownMutex: sync.RWMutex{},
	}
}

func (c *cache) getSocket(id string) (*Socket, error) {
	c.RLock()
	defer c.RUnlock()

	socket, ok := c.sockets[id]
	if !ok {
		return nil, fmt.Errorf("Socket with id %s not found", id)
	}
	return socket, nil
}

func (c *cache) setSocket(id string, s *Socket) {
	c.Lock()
	defer c.Unlock()
	c.sockets[id] = s
}

func (c *cache) deleteSocket(id string) {
	c.Lock()
	defer c.Unlock()
	delete(c.sockets, id)
}

func (sv *Server) getIndex(key string) int {
	parses := strings.Split(key, "-")
	index1, _ := strconv.ParseInt(parses[0], 10, 64)
	index2, _ := strconv.ParseInt(parses[1], 10, 64)

	return int(index1^index2) % len(sv.sockets)

}

func (sv *Server) getCache(key string) *cache {
	index := sv.getIndex(key)
	return sv.sockets[index]
}

func (sv *Server) On(callback func(*Socket)) {
	sv.app.Get("/ws", websocket.New(func(c *websocket.Conn) {

		socket := NewSocket(c)
		sv.Register(socket)
		callback(socket)

		defer func() {
			if event, ok := socket.events["disconnect"]; ok {
				event(socket, nil)
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
	sv.shutdownMutex.RLock()
	if sv.shutdownFlag {
		sv.shutdownMutex.RUnlock()
		return
	}
	sv.shutdownMutex.RUnlock()
	cache := sv.getCache(s.ID)
	cache.setSocket(s.ID, s)
	s.server = sv
}

func (sv *Server) Unregister(socket *Socket) {
	cache := sv.getCache(socket.ID)
	cache.deleteSocket(socket.ID)
	socket.conn.Close()
}

func (sv *Server) Close() {
	sv.shutdownMutex.Lock()
	sv.shutdownFlag = true
	sv.shutdownMutex.Unlock()

	sv.Lock()
	defer sv.Unlock()

	for _, cache := range sv.sockets {
		cache.Lock()
		for _, socket := range cache.sockets {
			socket.conn.Close()
		}
		cache.Unlock()
	}
}

func (sv *Server) Listen(address string) error {
	return sv.app.Listen(address)
}
