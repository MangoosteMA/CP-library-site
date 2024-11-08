package contests_parser

import (
	"sync"

	"cp-library-site/lib/common"
	"cp-library-site/lib/logger"
)

var (
	contestsMap = make(map[common.Platform][]*common.Contest)
	mt          sync.RWMutex
)

func GetScheduledContestsList() []*common.Contest {
	contests := make([]*common.Contest, 0)
	mt.RLock()
	for _, platformContests := range contestsMap {
		contests = append(contests, platformContests...)
	}
	mt.RUnlock()
	return contests
}

func Start() {
	logger.Info("starting parsing contests loop")
	go parseContestsLoop()
}
