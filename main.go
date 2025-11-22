package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type apiConfig struct {
	apiHits  atomic.Int32
	db       *sql.DB
	platform string
}

func (cfg *apiConfig) middlewareMetricsInc(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s - User-Agent: %s", r.Method, r.URL.String(), r.UserAgent())
		cfg.apiHits.Add(1)
		next.ServeHTTP(w, r)
	})
}

func main() {
	const filepathRoot = "."

	const port = "8080"

	godotenv.Load()

	dbURL := os.Getenv("DB_URL")

	_, err := sql.Open("postgres", dbURL)

	if err != nil {
		log.Printf("Failed to establish connection with db")
	}

	fmt.Println("Database connection established!")

	router := gin.Default()
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
		})
	})

	fmt.Println("Server starting...")
	fmt.Println("Time:", time.Now().Format("2006-01-02 15:04:05"))
	fmt.Println("Tip: Press Ctrl+C to stop")
	fmt.Printf("API Available At Link: http://localhost:%s\n", port)
	router.Run()

}
