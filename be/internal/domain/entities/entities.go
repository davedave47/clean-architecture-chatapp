package entities

type UserChanges struct {
	Email    string
	Username string
}

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

func NewUser(ID, Username, Email string) User {
	return User{
		ID:       ID,
		Username: Username,
		Email:    Email,
	}
}

type Conversation struct {
	ID           string  `json:"id"`
	Participants []User  `json:"participants"`
	CreatedAt    string  `json:"createdAt"`
	Name         string  `json:"name"`
	LastMessage  Message `json:"lastMessage"`
}

func NewConversation(ID, Name string, Participants []User) Conversation {
	return Conversation{
		ID:           ID,
		Name:         Name,
		Participants: Participants,
	}
}

type Content struct {
	Text string `json:"text"`
	File bool   `json:"file"`
}

type Message struct {
	ID             string  `json:"id"`
	Content        Content `json:"content"`
	Sender         User    `json:"sender"`
	ConversationID string  `json:"conversationId"`
}

func NewMessage(Text string, File bool, ID string, Sender User, ConversationID string) Message {
	return Message{
		ID: "",
		Content: Content{
			Text: Text,
			File: File,
		},
		Sender:         Sender,
		ConversationID: ConversationID,
	}
}

type Request struct {
	ID        string `json:"id"`
	Sender    User   `json:"sender"`
	Receiver  User   `json:"receiver"`
	CreatedAt string `json:"createdAt"`
}

func NewRequest(ID string, Sender, Receiver User, CreatedAt string) Request {
	return Request{
		ID:        ID,
		Sender:    Sender,
		Receiver:  Receiver,
		CreatedAt: CreatedAt,
	}
}
