package users

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Login    string `gorm:"unique"`
	Password string
	Role     uint
}

const (
	ROLE_REGULAR uint = iota
	ROLE_ADMIN        = iota
)
