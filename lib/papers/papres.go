package papers

import (
	"cp-library-site/lib/config"
	"cp-library-site/lib/logger"
)

var (
	AlgoContainer *PapersContainer
	DevContainer  *PapersContainer
)

func InitContainers(config *config.TConfig) {
	var err error
	AlgoContainer, err = NewContainer(config.Algo.ConfigPath, config.Algo.Storage)
	if err != nil {
		panic(logger.Error("did not initialized algo papers container. Reason: %s", err))
	}

	DevContainer, err = NewContainer(config.Dev.ConfigPath, config.Dev.Storage)
	if err != nil {
		panic(logger.Error("did not initialized dev papers container. Reason: %s", err))
	}

	logger.Info("papers containers are successfully initialized")
}
