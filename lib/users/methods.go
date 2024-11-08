package users

import (
	"errors"
	"fmt"
	"strings"

	"cp-library-site/lib/logger"

	"github.com/mattn/go-sqlite3"
	"gorm.io/gorm"
)

func GetUserRole(secret string) (uint, error) {
	switch secret {
	case regularSecret:
		return ROLE_REGULAR, nil
	case adminSecret:
		return ROLE_ADMIN, nil
	default:
		return 0, errors.New("incorrect secret")
	}
}

func ValidatePassword(password string) error {
	if len(password) < 3 {
		return errors.New("password length must be at least 3")
	}
	if strings.Contains(password, ";") {
		return errors.New("password contains forbidden symbol ';'")
	}
	return nil
}

func RegisterUser(login, password string, role uint) (*User, error) {
	newUser := User{
		Login:    login,
		Password: password,
		Role:     role,
	}

	if err := db.Create(&newUser).Error; err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) && sqliteErr.ExtendedCode == sqlite3.ErrConstraintUnique {
			return nil, errors.New("login is already used")
		}

		logger.Error("[RegisterUser] unknown error: %s", err)
		return nil, fmt.Errorf("unknown error: %s", err)
	}

	logger.Info("new user created. Id: %d, login: \"%s\", role: %d", newUser.ID, login, role)
	return &newUser, nil
}

func FindUser(login, password string) (*User, error) {
	var user User
	if err := db.Where("login = ?", login).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("incorrect login")
		}

		logger.Error("[FindUser] unknown error: %s", err)
		return nil, fmt.Errorf("unknown error: %s", err)
	}

	if user.Password != password {
		return nil, errors.New("incorrect password")
	}
	return &user, nil
}

func FindUserById(id uint) *User {
	var user User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		return nil
	}
	return &user
}
