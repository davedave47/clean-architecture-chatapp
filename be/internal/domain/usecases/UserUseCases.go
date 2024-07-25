package usecases

import (
	"root/internal/domain/entities"
	"root/internal/domain/interfaces"

	"golang.org/x/crypto/bcrypt"
)

type UserUseCases struct {
	UserRepo interfaces.UserRepository
}

func NewUserUseCases(userRepo interfaces.UserRepository) *UserUseCases {
	return &UserUseCases{UserRepo: userRepo}
}

func (usecases *UserUseCases) GetUserByEmail(email string) (*entities.User, error) {
	user, _, err := usecases.UserRepo.GetUserByEmail(email)
	return user, err
}

func (usecases *UserUseCases) GetAllUsers() ([]*entities.User, error) {
	return usecases.UserRepo.GetAllUsers()
}

func (usecases *UserUseCases) GetUserById(id string) (*entities.User, error) {
	return usecases.UserRepo.GetUserById(id)
}

func (usecases *UserUseCases) UpdateUser(id string, changes *entities.UserChanges) (*entities.User, error) {
	return usecases.UserRepo.UpdateUser(id, changes)
}

func (usecases *UserUseCases) UpdatePassword(id string, password string) (*entities.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	return usecases.UserRepo.UpdatePassword(id, string(hashedPassword))
}

func (usecases *UserUseCases) DeleteUser(id string) error {
	return usecases.UserRepo.DeleteUser(id)
}

func (usecases *UserUseCases) GetUserByName(name string) ([]*entities.User, error) {
	return usecases.UserRepo.GetUserByName(name)
}
