package guess_the_code

import (
	"errors"
	"os"
	"path/filepath"

	"cp-library-site/lib/config"
	"cp-library-site/lib/logger"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	db               *gorm.DB
	testingDirectory string
)

func InitDB(config *config.TConfig) {
	const ERROR_MESSAGE = "did not created guess the code db. Reason: "

	testingDirectory = filepath.Dir(config.GuessTheCodeDBPath)
	if err := os.MkdirAll(testingDirectory, 0755); err != nil {
		panic(logger.Error("%s%s", ERROR_MESSAGE, err))
	}

	if _, err := os.Stat(config.GuessTheCodeDBPath); errors.Is(err, os.ErrNotExist) {
		if _, err := os.Create(config.GuessTheCodeDBPath); err != nil {
			panic(logger.Error("%s%s", ERROR_MESSAGE, err))
		}
	}

	var err error
	db, err = gorm.Open(sqlite.Open(config.GuessTheCodeDBPath), &gorm.Config{})
	if err != nil {
		panic(logger.Error("%s%s", ERROR_MESSAGE, err))
	}

	if err := db.AutoMigrate(&Game{}); err != nil {
		panic(logger.Error("%s%s", ERROR_MESSAGE, err))
	}

	logger.Info("guess the code database is successfully created")
}
