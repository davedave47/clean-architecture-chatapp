package usecases

import (
	"os"
	"root/internal/domain/interfaces"

	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

type AuthUseCases struct {
	UserRepo interfaces.UserRepository
}

func NewAuthUseCases(userRepo interfaces.UserRepository) *AuthUseCases {
	return &AuthUseCases{UserRepo: userRepo}
}

func (usecases AuthUseCases) CreateUser(name string, email string, password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	user, err := usecases.UserRepo.CreateUser(name, email, string(hashedPassword))
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id": user.ID,
	})
	tokenSecret := os.Getenv("SECRET_KEY")
	tokenString, err := token.SignedString([]byte(tokenSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (usecases AuthUseCases) Login(email string, password string) (string, error) {
	user, userpassword, err := usecases.UserRepo.GetUserByEmail(email)
	if err != nil {
		return "", err
	}
	err = bcrypt.CompareHashAndPassword([]byte(userpassword), []byte(password))
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id": user.ID,
	})
	tokenSecret := os.Getenv("SECRET_KEY")
	tokenString, err := token.SignedString([]byte(tokenSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
