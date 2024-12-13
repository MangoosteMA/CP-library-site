package guess_the_code

import (
	"errors"
	"fmt"

	"cp-library-site/lib/logger"

	"gorm.io/gorm"
)

func GetGame(gameId uint) (*Game, error) {
	var game Game
	if err := db.Where("ID = ?", gameId).First(&game).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("there is not game with id: %d", gameId)
		}

		logger.Error("[GetGame] unknown error: %s", err)
		return nil, fmt.Errorf("unknown error: %s", err)
	}

	return &game, nil
}

func ModifyGame(gameId uint, game Game) error {
	currentGame, err := GetGame(gameId)
	if err != nil {
		return err
	}

	currentGame.MainCode = game.MainCode
	currentGame.TestsDescriptor = game.TestsDescriptor
	db.Save(&currentGame)
	return nil
}

func GetTestAnswer(gameId uint, a, b, c string) (string, error) {
	game, err := GetGame(gameId)
	if err != nil {
		return "", err
	}

	return ExecuteCode(game.MainCode, a, b, c)
}

func NewGame() (uint, error) {
	newGame := Game{
		MainCode:        "def check(a: int, b: int, c: int) -> bool:\n    pass",
		TestsDescriptor: "Random [1:100] [1:100] [1:100]",
	}

	if err := db.Create(&newGame).Error; err != nil {
		logger.Error("did not create new game. Reason %s", err)
		return 0, err
	}

	logger.Info("New game created. Id: %d", newGame.ID)
	return newGame.ID, nil
}
