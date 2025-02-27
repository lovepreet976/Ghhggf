# Ghhggfpackage config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds application configurations
type Config struct {
	DbHost string
	DbPort string
	DbUser string
	DbPass string
	DbName string
	ServerPort string
}

// LoadConfig reads configurations from .env
func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	return &Config{
		DbHost: os.Getenv("DB_HOST"),
		DbPort: os.Getenv("DB_PORT"),
		DbUser: os.Getenv("DB_USER"),
		DbPass: os.Getenv("DB_PASS"),
		DbName: os.Getenv("DB_NAME"),
		ServerPort: os.Getenv("SERVER_PORT"),
	}
}
