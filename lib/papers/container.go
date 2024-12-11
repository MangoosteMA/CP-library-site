package papers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"sync"
	"text/template"

	"cp-library-site/lib/logger"

	"github.com/metalim/jsonmap"
)

type PapersContainer struct {
	config           *jsonmap.Map
	draftsFreeConfig *jsonmap.Map
	configPath       string
	storage          string
	mt               sync.RWMutex
	papers           []*Paper
	htmlTemplates    *template.Template
}

func (container *PapersContainer) GetHTML(name string) (string, error) {
	var t *template.Template
	{
		container.mt.RLock()
		defer container.mt.RUnlock()
		t = container.htmlTemplates.Lookup(name + HTML_EXTENTION)
	}

	if t == nil {
		return "", errors.New("no such template")
	}

	var buf bytes.Buffer
	err := t.Execute(&buf, nil)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}

func (container *PapersContainer) GetConfig() ([]byte, error) {
	container.mt.RLock()
	defer container.mt.RUnlock()
	return json.Marshal(container.config)
}

func (container *PapersContainer) GetDraftsFreeConfig() ([]byte, error) {
	container.mt.RLock()
	defer container.mt.RUnlock()
	return json.Marshal(container.draftsFreeConfig)
}

func findPaper(papers []*Paper, htmlName string) *Paper {
	for _, paper := range papers {
		if paper.HTMLName == htmlName {
			return paper
		}
	}
	return nil
}

func (container *PapersContainer) findPaper(htmlName string) *Paper {
	return findPaper(container.papers, htmlName)
}

func (container *PapersContainer) updatePapers(newPapers []*Paper) error {
	for _, paper := range newPapers {
		for _, existingPaper := range container.papers {
			if paper.HTMLName == existingPaper.HTMLName && !reflect.DeepEqual(existingPaper.ParentFolders, paper.ParentFolders) {
				return errors.New("two different files has same HTML name")
			}
		}
	}

	for _, paper := range container.papers {
		if findPaper(newPapers, paper.HTMLName) == nil {
			if err := paper.Delete(); err != nil {
				return fmt.Errorf("failed to create new paper. Reason: %s", err)
			}
		}
	}

	for _, paper := range newPapers {
		if findPaper(container.papers, paper.HTMLName) == nil {
			if err := paper.Touch(); err != nil {
				return fmt.Errorf("failed to create new paper. Reason: %s", err)
			}
		}
	}

	newTemplates, err := loadHTMLTemplates(newPapers)
	if err != nil {
		return fmt.Errorf("failed to load html templates. Reason: %s", err)
	}

	container.htmlTemplates = newTemplates
	container.papers = newPapers
	return nil
}

func (container *PapersContainer) UpdateConfig(newConfig string) error {
	parsedConfig := jsonmap.New()
	if err := json.Unmarshal([]byte(newConfig), &parsedConfig); err != nil {
		return err
	}

	newPapers, err := loadPapers(parsedConfig, container.storage, make([]string, 0))
	if err != nil {
		return err
	}

	container.mt.Lock()
	defer container.mt.Unlock()

	if err := container.updatePapers(newPapers); err != nil {
		return err
	}

	return container.writeConfig(parsedConfig)
}

func (container *PapersContainer) UpdateMtex(htmlName string, mtex []byte) error {
	container.mt.Lock()
	defer container.mt.Unlock()

	paper := container.findPaper(htmlName)
	if paper == nil {
		return fmt.Errorf("paper %s not found", htmlName)
	}

	if err := paper.CompileMtex(mtex); err != nil {
		return err
	}

	var err error
	container.htmlTemplates, err = loadHTMLTemplates(container.papers)
	return err
}

func (container *PapersContainer) GetImageStoragePath(htmlName, imageName string) string {
	return filepath.Join(container.storage, fmt.Sprintf("%s-%s", htmlName, imageName))
}

func (container *PapersContainer) getImagesFilesList(htmlName string) []string {
	return searchImages(container.storage, htmlName)
}

func (container *PapersContainer) GetImagesList(htmlName string) []string {
	images := make([]string, 0)
	for _, imageFullName := range container.getImagesFilesList(htmlName) {
		imageBaseName := getImageBaseName(htmlName, imageFullName)
		images = append(images, imageBaseName)
	}
	return images
}

func (container *PapersContainer) writeConfig(newConfig *jsonmap.Map) error {
	content, err := json.MarshalIndent(newConfig, "", "    ")
	if err != nil {
		return err
	}

	container.config = newConfig
	return os.WriteFile(container.configPath, content, 0660)
}

func buildConfig(papers []*Paper) (*jsonmap.Map, error) {
	config := jsonmap.New()

	for _, paper := range papers {
		node := config
		for _, folder := range paper.ParentFolders {
			if nxt, ok := node.Get(folder); ok {
				switch value := nxt.(type) {
				case *jsonmap.Map:
					node = value

				default:
					return nil, fmt.Errorf("couldn't rebuild the config: incorrect type. Expeced *jsonmap.Map, got %T", value)
				}
			} else {
				nxt := jsonmap.New()
				node.Push(folder, nxt)
				node = nxt
			}
		}

		if _, ok := node.Get(paper.Name); ok {
			return nil, fmt.Errorf("couldn't rebuild the config: file \"%s\" occurs twice", paper.Name)
		}
		node.Push(paper.Name, paper.HTMLName)
	}

	return config, nil
}

func (container *PapersContainer) rebuildConfig() error {
	newConfig, err := buildConfig(container.papers)
	if err != nil {
		return err
	}

	container.draftsFreeConfig, err = buildDraftsFreeConfig(container.papers)
	if err != nil {
		return err
	}

	return container.writeConfig(newConfig)
}

type RenameArguments struct {
	HTMLName string `json:"htmlName"`
	FileName string `json:"fileName"`
	FilePath string `json:"filePath"`
}

func (container *PapersContainer) RenamePaper(htmlName string, args *RenameArguments) error {
	container.mt.Lock()
	defer container.mt.Unlock()

	paper := container.findPaper(htmlName)
	if paper == nil {
		return fmt.Errorf("paper %s not found", htmlName)
	}

	if p := container.findPaper(args.HTMLName); p != nil && p != paper {
		return fmt.Errorf("paper %s already exists", args.HTMLName)
	}

	if err := paper.Rename(args); err != nil {
		return err
	}

	for _, imageFullName := range container.getImagesFilesList(htmlName) {
		imageName := getImageBaseName(htmlName, imageFullName)
		oldImagePath := container.GetImageStoragePath(htmlName, imageName)
		newImagePath := container.GetImageStoragePath(args.HTMLName, imageName)

		if err := os.Rename(oldImagePath, newImagePath); err != nil {
			logger.Error("Failed to move image %s to %s while renaming paper %s. Reason: %s", oldImagePath, newImagePath, htmlName, err)
		}
	}

	if err := container.rebuildConfig(); err != nil {
		return err
	}

	var err error
	container.htmlTemplates, err = loadHTMLTemplates(container.papers)
	return err
}

type FinalPaper struct {
	HTMLName      string
	ParentFolders []string
	Name          string
	MtexSource    []byte
}

func (container *PapersContainer) ReadPaper(name string) (*FinalPaper, error) {
	container.mt.RLock()
	defer container.mt.RUnlock()

	paper := container.findPaper(name)
	if paper == nil {
		return nil, fmt.Errorf("paper %s not found", name)
	}

	mtexSource, err := paper.Read()
	if err != nil {
		return nil, err
	}

	return &FinalPaper{
		HTMLName:      paper.HTMLName,
		ParentFolders: paper.ParentFolders,
		Name:          paper.Name,
		MtexSource:    mtexSource,
	}, nil
}

func getConfigContent(configPath string) (*jsonmap.Map, error) {
	content, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}

	config := jsonmap.New()
	if err := json.Unmarshal(content, &config); err != nil {
		return nil, err
	}

	return config, nil
}

func loadPapers(config *jsonmap.Map, storage string, parentFolders []string) ([]*Paper, error) {
	papers := make([]*Paper, 0)
	for elem := config.First(); elem != nil; elem = elem.Next() {
		name := elem.Key()

		switch value := elem.Value().(type) {
		case string:
			papers = append(papers, &Paper{
				StoragePath:   storage,
				HTMLName:      value,
				ParentFolders: parentFolders,
				Name:          name,
			})

		case *jsonmap.Map:
			childsPapers, err := loadPapers(value, storage, append(parentFolders, name))
			if err != nil {
				return nil, err
			}
			papers = append(papers, childsPapers...)

		default:
			return nil, errors.New("invalid json format")
		}
	}
	return papers, nil
}

func loadHTMLTemplates(papers []*Paper) (*template.Template, error) {
	if len(papers) == 0 {
		return template.New(""), nil
	}

	files := make([]string, 0, len(papers))
	for _, paper := range papers {
		files = append(files, paper.GetHtmlStoragePath())
	}
	return template.ParseFiles(files...)
}

func compilePapers(papers []*Paper) error {
	for _, paper := range papers {
		source, err := paper.GetMtexSource()
		if err != nil {
			return err
		}
		err = paper.CompileMtex(source)
		if err != nil {
			return err
		}
	}
	return nil
}

func buildDraftsFreeConfig(papers []*Paper) (*jsonmap.Map, error) {
	draftsFreePapers := make([]*Paper, 0, len(papers))
	for _, paper := range papers {
		if !strings.HasSuffix(paper.HTMLName, "-draft") {
			draftsFreePapers = append(draftsFreePapers, paper)
		}
	}
	return buildConfig(draftsFreePapers)
}

func NewContainer(configPath string, storagePath string) (*PapersContainer, error) {
	config, err := getConfigContent(configPath)
	if err != nil {
		return nil, err
	}

	papers, err := loadPapers(config, storagePath, make([]string, 0))
	if err != nil {
		return nil, err
	}

	draftsFreeConfig, err := buildDraftsFreeConfig(papers)
	if err != nil {
		return nil, err
	}

	err = compilePapers(papers)
	if err != nil {
		return nil, err
	}

	htmlTemplates, err := loadHTMLTemplates(papers)
	if err != nil {
		return nil, err
	}

	logger.Debug("parsed templates%s", htmlTemplates.DefinedTemplates())

	return &PapersContainer{
		config:           config,
		draftsFreeConfig: draftsFreeConfig,
		configPath:       configPath,
		storage:          storagePath,
		papers:           papers,
		htmlTemplates:    htmlTemplates,
	}, nil
}
