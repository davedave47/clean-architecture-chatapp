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
		extRe := regexp.MustCompile(`\.(\w+)$`)
		extMatch := extRe.FindStringSubmatch(filename)

		if len(extMatch) > 1 {
			ext := extMatch[1]
			switch ext {
			case "mp4", "mov":
				c.Set("Content-Type", "video/mp4")
			case "mp3":
				c.Set("Content-Type", "audio/mpeg")
			case "jpg", "jpeg":
				c.Set("Content-Type", "image/jpeg")
			case "png":
				c.Set("Content-Type", "image/png")
			case "gif":
				c.Set("Content-Type", "image/gif")
			case "webp":
				c.Set("Content-Type", "image/webp")
				// default:
				// 	c.Set("Content-Encoding", "br")
			}
		}

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
