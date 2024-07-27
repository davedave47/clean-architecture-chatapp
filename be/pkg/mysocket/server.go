package mysocket

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type Server struct {
	events        map[string]func(*Socket, any) error
	sockets       []*cache
	app           *fiber.App
	config        *websocket.Config
	shutdownFlag  bool
	shutdownMutex sync.RWMutex
	register      chan *Socket
	unregister    chan *Socket
	ctx           context.Context
	cancel        context.CancelFunc
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
	ctx, cancel := context.WithCancel(context.Background())
	if len(config) == 0 {
		return &Server{
			sockets:       initialCache,
			app:           r,
			shutdownFlag:  false,
			shutdownMutex: sync.RWMutex{},
			events:        make(map[string]func(*Socket, any) error),
			register:      make(chan *Socket),
			unregister:    make(chan *Socket),
			ctx:           ctx,
			cancel:        cancel,
		}
	}
	return &Server{
		sockets:       initialCache,
		app:           r,
		config:        &config[0].Config,
		shutdownFlag:  false,
		shutdownMutex: sync.RWMutex{},
		events:        make(map[string]func(*Socket, any) error),
		register:      make(chan *Socket),
		unregister:    make(chan *Socket),
		ctx:           ctx,
		cancel:        cancel,
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
		sv.register <- socket
		callback(socket)

		defer func() {
			if socket.events.Contains("disconnect") {
				sv.events["disconnect"](socket, nil)
			}
			sv.unregister <- socket
		}()

		var message Message
		for {
			err := c.ReadJSON(&message)
			if err != nil {
				break
			}
			if socket.events.Contains(message.Event) {
				sv.events[message.Event](socket, message.Data)
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
	fmt.Println("Registering socket", s.ID)
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

	for event := range sv.events {
		delete(sv.events, event)
	}

	sv.cancel()

	close(sv.register)
	close(sv.unregister)
}

func (sv *Server) Listen(address string) error {
	go sv.Run()
	return sv.app.Listen(address)
}

func (sv *Server) addEvent(event string, callback func(*Socket, any) error) {
	sv.Lock()
	defer sv.Unlock()
	sv.events[event] = callback
}

func (sv *Server) Run() {
	for {
		select {
		case <-sv.ctx.Done():
			return
		case socket := <-sv.register:
			sv.Register(socket)
		case socket := <-sv.unregister:
			sv.Unregister(socket)
		}
	}
}
