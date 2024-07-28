package router

import (
	"fmt"
	"regexp"

	"github.com/gofiber/fiber/v2"
)

// NewRouter creates a new router
func NewRouter(app *fiber.App) *fiber.App {
	app.Static("/uploads", "../../../uploads")

	app.Get("/uploads/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		filepath := "./uploads/" + id
		re := regexp.MustCompile(`-\d+$`)
		filename := re.ReplaceAllString(id, "")
		fmt.Println(filename)
		c.Set("Content-Disposition", "attachment; filename="+filename)
		return c.SendFile(filepath, true)
	})

	api := app.Group("/api")
	initAuthRoutes(&api)
	initUserRouter(&api)
	initConvoRoutes(&api)
	initFriendRoutes(&api)
	return app
}
