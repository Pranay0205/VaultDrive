package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync/atomic"

	"github.com/Pranay0205/VaultDrive/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type ApiConfig struct {
	apiHits   atomic.Int32
	dbQueries *database.Queries
	jwtSecret string
}

func (cfg *ApiConfig) middlewareMetricsInc(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s - User-Agent: %s", r.Method, r.URL.String(), r.UserAgent())
		cfg.apiHits.Add(1)
		next.ServeHTTP(w, r)
	})
}

func main() {

	godotenv.Load()

	dbURL := os.Getenv("DB_URL")

	fmt.Printf("Database URL: %s...\n", dbURL[:12])

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		fmt.Printf("Error connecting to the database: %v\n", err)
		return
	}
	defer db.Close()

	apiConfig := ApiConfig{apiHits: atomic.Int32{}, dbQueries: database.New(db)}

	fmt.Println("Connected to the database successfully.")

	mux := http.NewServeMux()
	mux.Handle("GET /healthz", apiConfig.middlewareMetricsInc(http.HandlerFunc(healthCheckHandler)))

	mux.Handle("POST /register", apiConfig.middlewareMetricsInc(http.HandlerFunc(apiConfig.registerUserHandler)))

	mux.Handle("/login", apiConfig.middlewareMetricsInc(http.HandlerFunc(apiConfig.handlerLogin)))

	mux.Handle("GET /user-by-username", apiConfig.middlewareMetricsInc(http.HandlerFunc(apiConfig.getUserByUsernameHandler)))

	mux.Handle("GET /user-by-email", apiConfig.middlewareMetricsInc(http.HandlerFunc(apiConfig.getUserByEmailHandler)))

	fmt.Printf("Starting server on port %s...\n", port)
	err = http.ListenAndServe(":"+port, mux)
	if err != nil {
		log.Fatalf("Error starting server: %v\n", err)
	}

}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	response := map[string]string{
		"status": "ok",
	}
	json.NewEncoder(w).Encode(response)
}
