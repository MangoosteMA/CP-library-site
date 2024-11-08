package users

import (
	"errors"
	"fmt"
	"math/rand/v2"
	"os"
	"path/filepath"

	"cp-library-site/lib/config"
	"cp-library-site/lib/logger"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	db            *gorm.DB
	regularSecret string
	adminSecret   string
)

func createSingleSecret(length int) string {
	secret := ""
	for i := 0; i < length; i++ {
		c := rand.IntN(26 + 26 + 10)
		if c < 26 {
			secret += string('a' + c)
		} else if c < 26+26 {
			secret += string('A' + (c - 26))
		} else {
			secret += string('0' + (c - 26 - 26))
		}
	}
	return secret
}

func SecretsInfo() string {
	return fmt.Sprintf("Regular: %s; Admin: %s\n", regularSecret, adminSecret)
}

func createSecrets() {
	regularSecret = createSingleSecret(15)
	adminSecret = createSingleSecret(15)

	logger.Info("registration secrets are created. %s", SecretsInfo())
}

func InitDB(config *config.TConfig) {
	createSecrets()

	const ERROR_MESSAGE = "did not created users db. Reason: "

	if err := os.MkdirAll(filepath.Dir(config.UsersDBPath), 0700); err != nil {
		panic(logger.Error("%s%s", ERROR_MESSAGE, err))
	}

	if _, err := os.Stat(config.UsersDBPath); errors.Is(err, os.ErrNotExist) {
		if _, err := os.Create(config.UsersDBPath); err != nil {
			panic(logger.Error("%s%s", ERROR_MESSAGE, err))
		}
	}

	var err error
	db, err = gorm.Open(sqlite.Open(config.UsersDBPath), &gorm.Config{})
	if err != nil {
		panic(logger.Error("%s%s", ERROR_MESSAGE, err))
	}

	if err := db.AutoMigrate(&User{}); err != nil {
		panic(logger.Error("%s%s", ERROR_MESSAGE, err))
	}

	logger.Info("users database is successfully created")
}
