package mysocket

import (
	"fmt"

	"github.com/gofiber/contrib/websocket"
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

func NewSocket(conn *websocket.Conn) *Socket {
	return &Socket{
		events: make(map[string]func(*Socket, any) error),
		ID:     uuid.New().String(),
		conn:   conn,
	}
}

func (s *Socket) On(message string, callback func(*Socket, any) error) {
	s.events[message] = callback
}
func (s *Socket) EmitMessage(event string, data any) error {
	if s == nil {
		return fmt.Errorf("Socket is nil")
	}
	fmt.Println("Emitting message", event, "to", s.ID)
	return s.conn.WriteJSON(Message{
		Event: event,
		Data:  data,
	})
}

func (s *Socket) To(socketId string) *Socket {
	sv := s.server
	cache := sv.getCache(socketId)

	socket, err := cache.getSocket(socketId)

	if err != nil {
		fmt.Println("Socket with id", socketId, "not found")
		return nil
	}
	return socket
}

func (s *Socket) Locals(key string) any {
	return s.conn.Locals(key)
}

func (s *Socket) Broadcast(event string, data any) {
	sv := s.server
	for _, cache := range sv.sockets {
		cache.RLock()
		for _, socket := range cache.sockets {
			socket.EmitMessage(event, data)
		}
		cache.RUnlock()
	}
}

func (s *Socket) Close() {
	s.conn.Close()
}

type Map map[string]interface{}
