package papers

import (
	"os"
	"path/filepath"
	"strings"
)

func isImageExtention(ext string) bool {
	var imagesExtentions = []string{".png", ".jpeg"}
	for _, imageExtention := range imagesExtentions {
		if imageExtention == ext {
			return true
		}
	}
	return false
}

func searchImages(storagePath, htmlName string) []string {
	entries, err := os.ReadDir(storagePath)
	if err != nil {
		return nil
	}

	images := make([]string, 0)
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		entryName := entry.Name()
		if strings.HasPrefix(entryName, htmlName) && isImageExtention(filepath.Ext(entryName)) {
			images = append(images, entryName)
		}
	}
	return images
}

func getImageBaseName(htmlName, imageFullName string) string {
	return imageFullName[len(htmlName)+1:]
}
