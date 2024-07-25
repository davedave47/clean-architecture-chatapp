package interfaces

import (
	"root/internal/domain/entities"
)

type UserChanges struct {
	Email    string
	Username string
}

// UserRepository is a repository for users
type UserRepository interface {
	CreateUser(name string, email string, password string) (*entities.User, error)
	GetUserByEmail(email string) (*entities.User, string, error)
	GetAllUsers() ([]*entities.User, error)
	GetUserById(id string) (*entities.User, error)
	UpdateUser(id string, changes *entities.UserChanges) (*entities.User, error)
	UpdatePassword(id string, password string) (*entities.User, error)
	DeleteUser(id string) error
	GetUserByName(name string) ([]*entities.User, error)
}
