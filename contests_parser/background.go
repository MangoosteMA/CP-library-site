package contests_parser

import (
	"time"

	"cp-library-site/lib/atcoder"
	"cp-library-site/lib/codeforces"
	"cp-library-site/lib/common"
	"cp-library-site/lib/logger"
)

func updatePlatformContests(platform common.Platform, contests []*common.Contest) {
	logger.Debug("parsed %d contests for platform %s", len(contests), platform)
	mt.Lock()
	contestsMap[platform] = contests
	mt.Unlock()
}

func parseContests() {
	if cfContests, err := codeforces.RequestScheduledContests(); err == nil {
		updatePlatformContests(common.PLATFORM_CODEFORCES, cfContests)
	} else {
		logger.Debug("failed to parse codeforces contests. Reason: %v", err)
	}

	if atcoderContests, err := atcoder.RequestScheduledContests(); err == nil {
		updatePlatformContests(common.PLATFORM_ATCODER, atcoderContests)
	} else {
		logger.Debug("failed to parse atcoder contests. Reason: %v", err)
	}
}

func parseContestsLoop() {
	parseContests()
	for range time.Tick(15 * time.Minute) {
		parseContests()
	}
}
