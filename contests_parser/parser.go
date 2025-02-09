package contests_parser

import (
	"sync"
	"time"

	"cp-library-site/lib/common"
	"cp-library-site/lib/logger"
)

var (
	contestsMap = make(map[common.Platform][]*common.Contest)
	mt          sync.RWMutex
)

func GetScheduledContestsList() []*common.Contest {
	contests := make([]*common.Contest, 0)
	now := time.Now()
	mt.RLock()
	for _, platformContests := range contestsMap {
		for _, contest := range platformContests {
			if contest.End().After(now) {
				contests = append(contests, contest)
			}
		}
	}
	mt.RUnlock()
	return contests
}

func Start() {
	logger.Info("starting parsing contests loop")
	go parseContestsLoop()
}
