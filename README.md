package database

import (
	"fmt"
	"log"

	"library-management/config"
	"library-management/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// ConnectPostgres initializes PostgreSQL connection
func ConnectPostgres(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DbHost, cfg.DbUser, cfg.DbPass, cfg.DbName, cfg.DbPort,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	log.Println("Connected to PostgreSQL successfully!")

	// Auto-migrate tables
	if err := db.AutoMigrate(&models.Library{}, &models.Book{}, &models.User{}, &models.Issue{}); err != nil {
		return nil, err
	}

	return db, nil
}

