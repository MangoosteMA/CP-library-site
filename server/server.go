package server

import (
	"io"
	"os"

	"cp-library-site/lib/config"
	"cp-library-site/lib/logger"
	"cp-library-site/server/views"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func setupGinLogger(ginLogPath string) {
	ginLogFile, err := os.OpenFile(ginLogPath+".log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0660)
	if err != nil {
		panic(logger.Error("failed to open gin log file: %s", err))
	}
	gin.DefaultWriter = io.Writer(ginLogFile)
}

func setupGinSession(router *gin.Engine, secret string) {
	store := cookie.NewStore([]byte(secret))
	router.Use(sessions.Sessions("usersession", store))
}

func registerViews(router *gin.Engine) {
	router.GET("/", views.HomepageGET)
	router.POST("/log-out", views.LogOut)
	router.GET("/secret/login-secrets", views.LogSecretsGET)

	router.GET("/login", views.LoginPageGET)
	router.POST("/login", views.LoginPagePOST)
	router.GET("/register", views.RegisterPageGET)
	router.POST("/register", views.RegisterPagePOST)

	router.GET("/apps/graph-editor", views.GraphEditorPageGET)
	router.GET("/images/:image", views.ImagesGET)
	router.GET("/api/schedule", views.ScheduledContestsGET)

	router.GET("/lib/algo", views.LibAlgoGET)
	router.PUT("/lib/algo", views.LibAlgoPUT)
	router.GET("/lib/dev", views.LibDevGET)
	router.PUT("/lib/dev", views.LibDevPUT)

	router.GET("/lib/algo/:html", views.LibAlgoFileInfoGET)
	router.PUT("/lib/algo/:html", views.LibAlgoFileInfoPUT)
	router.POST("/lib/algo/:html", views.LibAlgoFileInfoPOST)
	router.PATCH("/lib/algo/:html", views.LibAlgoFileInfoPATCH)
	router.DELETE("/lib/algo/:html", views.LibAlgoFileInfoDELETE)
	router.GET("/lib/algo/:html/:image", views.LibAlgoFileInfoImageGET)

	router.GET("/lib/dev/:html", views.LibDevFileInfoGET)
	router.PUT("/lib/dev/:html", views.LibDevFileInfoPUT)
	router.POST("/lib/dev/:html", views.LibDevFileInfoPOST)
	router.PATCH("/lib/dev/:html", views.LibDevFileInfoPATCH)
	router.DELETE("/lib/dev/:html", views.LibDevFileInfoDELETE)
	router.GET("/lib/dev/:html/:image", views.LibDevFileInfoImageGET)
}

func Start(config *config.TConfig) {
	logger.Info("starting the server. Host: %s", config.Host)

	setupGinLogger(config.GinLogPath)
	router := gin.Default()

	setupGinSession(router, config.GinSecret)

	router.Delims("{%", "%}")
	router.Static("/static", "./static")
	router.LoadHTMLGlob("templates/**/*.html")

	registerViews(router)

	err := router.Run(config.Host)
	if err != nil {
		panic(logger.Error("server is interrupted with error: %s", err))
	}
}
