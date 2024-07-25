package entities

import "time"

type UserChanges struct {
	Email    string
	Username string
}

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

type Conversation struct {
	ID           string    `json:"id"`
	Participants []*User   `json:"participants"`
	CreatedAt    time.Time `json:"createdAt"`
	Name         string    `json:"name"`
	LastMessage  *Message  `json:"lastMessage,omitempty"`
}

type Content struct {
	Text  string  `json:"text"`
	File  bool    `json:"file"`
	Files []Files `json:"files" bson:"-"`
}

type Files struct {
	FileName string `json:"filename"`
	Buffer   []byte `json:"file"`
}

type Message struct {
	ID             string    `json:"id" bson:"-"`
	Content        Content   `json:"content"`
	SenderID       string    `json:"senderId" bson:"senderId"`
	ConversationID string    `json:"conversationId" bson:"conversationId"`
	CreatedAt      time.Time `json:"createdAt" bson:"createdAt"`
}

type Request struct {
	ID        string    `json:"id"`
	Sender    User      `json:"sender"`
	Receiver  User      `json:"receiver"`
	CreatedAt time.Time `json:"createdAt"`
}
