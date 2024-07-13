package usecases

import (
	"root/internal/domain/entities"
	"root/internal/domain/interfaces"
)

type FriendUseCases struct {
	FriendRepo interfaces.FriendRepository
}

func NewFriendUseCases(friendRepo interfaces.FriendRepository) *FriendUseCases {
	return &FriendUseCases{FriendRepo: friendRepo}
}

func (usecases *FriendUseCases) CreateFriend(userId1 string, friendId string) error {
	return usecases.FriendRepo.CreateFriend(userId1, friendId)
}

func (usecases *FriendUseCases) CheckFriend(userId string, friendId string) (bool, error) {
	return usecases.FriendRepo.CheckFriend(userId, friendId)
}

func (usecases *FriendUseCases) GetFriends(userId string) ([]entities.User, error) {
	return usecases.FriendRepo.GetFriends(userId)
}

func (usecases *FriendUseCases) DeleteFriend(userId string, friendId string) error {
	return usecases.FriendRepo.DeleteFriend(userId, friendId)
}

func (usecases *FriendUseCases) RequestFriend(userId string, friendId string) error {
	return usecases.FriendRepo.RequestFriend(userId, friendId)
}

func (usecases *FriendUseCases) RejectFriendRequest(userId string, friendId string) error {
	return usecases.FriendRepo.RejectFriendRequest(userId, friendId)
}

func (usecases *FriendUseCases) AcceptFriendRequest(userId string, friendId string) error {
	err := usecases.FriendRepo.RejectFriendRequest(userId, friendId)
	if err != nil {
		return err

	}
	return usecases.FriendRepo.CreateFriend(userId, friendId)
}

func (usecases *FriendUseCases) RemoveFriendRequest(userId string, friendId string) error {
	return usecases.FriendRepo.RejectFriendRequest(friendId, userId)
}

func (usecases *FriendUseCases) GetReceivedFriendRequests(userId string) ([]entities.User, error) {
	return usecases.FriendRepo.GetReceivedFriendRequests(userId)
}

func (usecases *FriendUseCases) GetSentFriendRequests(userId string) ([]entities.User, error) {
	return usecases.FriendRepo.GetSentFriendRequests(userId)
}
