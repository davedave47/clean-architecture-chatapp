package interfaces

import (
	"root/internal/domain/entities"
)

type FriendRepository interface {
	CreateFriend(userId1 string, friendId string) error
	CheckFriend(userId string, friendId string) (bool, error)
	GetFriends(userId string) ([]*entities.User, error)
	DeleteFriend(userId string, friendId string) error
	RequestFriend(userId string, friendId string) error
	RejectFriendRequest(userId string, friendId string) error
	GetSentFriendRequests(userId string) ([]*entities.User, error)
	GetReceivedFriendRequests(userId string) ([]*entities.User, error)
}
