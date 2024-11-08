package papers

import (
	"fmt"
	"os"
	"strings"
	"sync"

	"cp-library-site/lib/mtex"
)

const (
	MTEX_EXTENTION = ".mtex"
	HTML_EXTENTION = ".html"
)

type Paper struct {
	StoragePath   string
	HTMLName      string
	ParentFolders []string
	Name          string
	mt            sync.RWMutex
}

func (paper *Paper) getStorageFile(fileName, extention string) string {
	return fmt.Sprintf("%s/%s%s", paper.StoragePath, fileName, extention)
}

func (paper *Paper) GetMtexStoragePath() string {
	return paper.getStorageFile(paper.HTMLName, MTEX_EXTENTION)
}

func (paper *Paper) GetHtmlStoragePath() string {
	return paper.getStorageFile(paper.HTMLName, HTML_EXTENTION)
}

func (paper *Paper) GetMtexSource() ([]byte, error) {
	paper.mt.RLock()
	defer paper.mt.RUnlock()
	return os.ReadFile(paper.GetMtexStoragePath())
}

func (paper *Paper) CompileMtex(source []byte) error {
	paper.mt.Lock()
	defer paper.mt.Unlock()

	if err := os.WriteFile(paper.GetMtexStoragePath(), source, 0660); err != nil {
		return err
	}
	return os.WriteFile(paper.GetHtmlStoragePath(), []byte(mtex.Compile(string(source))), 0660)
}

func (paper *Paper) Delete() error {
	paper.mt.Lock()
	defer paper.mt.Unlock()

	if err := os.Remove(paper.GetMtexStoragePath()); err != nil {
		return err
	}
	if err := os.Remove(paper.GetHtmlStoragePath()); err != nil {
		return err
	}
	return nil
}

func (paper *Paper) Touch() error {
	paper.mt.Lock()
	defer paper.mt.Unlock()

	if _, err := os.Create(paper.GetHtmlStoragePath()); err != nil {
		return err
	}
	if _, err := os.Create(paper.GetMtexStoragePath()); err != nil {
		return err
	}
	return nil
}

func (paper *Paper) Read() ([]byte, error) {
	paper.mt.RLock()
	defer paper.mt.RUnlock()
	return os.ReadFile(paper.GetMtexStoragePath())
}

func (paper *Paper) renameFiles(args *RenameArguments) error {
	for _, extention := range []string{MTEX_EXTENTION, HTML_EXTENTION} {
		oldStoragePath := paper.getStorageFile(paper.HTMLName, extention)
		newStoragePath := paper.getStorageFile(args.HTMLName, extention)
		if err := os.Rename(oldStoragePath, newStoragePath); err != nil {
			return fmt.Errorf("failed to rename %s file. Reason: %s", extention, err)
		}
	}
	return nil
}

func (paper *Paper) Rename(args *RenameArguments) error {
	paper.mt.Lock()
	defer paper.mt.Unlock()

	if args.HTMLName != paper.HTMLName {
		if err := paper.renameFiles(args); err != nil {
			return err
		}
	}

	paper.HTMLName = args.HTMLName
	paper.ParentFolders = strings.Split(args.FilePath, "/")
	paper.Name = args.FileName

	return nil
}
