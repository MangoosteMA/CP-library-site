package guess_the_code

import "gorm.io/gorm"

type Game struct {
	gorm.Model
	MainCode        string
	TestsDescriptor string
}
