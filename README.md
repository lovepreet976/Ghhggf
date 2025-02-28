Final Project Structure

library-management/
│── config/              # Database configuration
│── models/              # Database models
│── controllers/         # Business logic
│── routes/              # API routes
│── middlewares/         # Authentication & authorization
│── utils/               # Helper functions
│── .env                 # Environment variables
│── schema.sql           # SQL file for database setup ✅
│── main.go              # Entry point of the application
│── go.mod               # Go module file
│── go.sum               # Go dependencies
📌 1. .env File for Secure Database Configuration

Create a .env file in the root directory:

.env
DB_HOST=localhost
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_NAME=library
DB_PORT=5432
SSL_MODE=disable
📌 2. Database Configuration

This will load the environment variables and connect to PostgreSQL.

config/db.go
package config

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
    _ "github.com/lib/pq"
)

var DB *sql.DB

func LoadEnv() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
}

func ConnectDB() {
    LoadEnv()

    dbHost := os.Getenv("DB_HOST")
    dbUser := os.Getenv("DB_USER")
    dbPassword := os.Getenv("DB_PASSWORD")
    dbName := os.Getenv("DB_NAME")
    dbPort := os.Getenv("DB_PORT")
    sslMode := os.Getenv("SSL_MODE")

    connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
        dbHost, dbUser, dbPassword, dbName, dbPort, sslMode)

    var err error
    DB, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    err = DB.Ping()
    if err != nil {
        log.Fatal("Database not reachable:", err)
    }

    fmt.Println("Database connected successfully!")
}
📌 3. Database Schema

This SQL script creates all required tables.

schema.sql
CREATE TABLE library (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contactnumber VARCHAR(15),
    role VARCHAR(50) NOT NULL CHECK (role IN ('Owner', 'Admin', 'Reader')),
    libid INT NOT NULL REFERENCES library(id) ON DELETE CASCADE
);

CREATE TABLE bookinventory (
    isbn VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    authors VARCHAR(200) NOT NULL,
    publisher VARCHAR(100),
    version VARCHAR(50),
    totalcopies INT NOT NULL CHECK (totalcopies >= 0),
    availablecopies INT NOT NULL CHECK (availablecopies >= 0)
);

CREATE TABLE requestevents (
    reqid SERIAL PRIMARY KEY,
    bookid VARCHAR(20) REFERENCES bookinventory(isbn) ON DELETE CASCADE,
    readerid INT REFERENCES users(id) ON DELETE CASCADE,
    requestdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approvaldate TIMESTAMP,
    approverid INT REFERENCES users(id),
    requesttype VARCHAR(20) CHECK (requesttype IN ('Issue', 'Return'))
);

CREATE TABLE issueregistry (
    issueid SERIAL PRIMARY KEY,
    isbn VARCHAR(20) REFERENCES bookinventory(isbn) ON DELETE CASCADE,
    readerid INT REFERENCES users(id) ON DELETE CASCADE,
    issueapproverid INT REFERENCES users(id),
    issuestatus VARCHAR(20) CHECK (issuestatus IN ('Issued', 'Returned')),
    issuedate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expectedreturndate TIMESTAMP,
    returndate TIMESTAMP,
    returnapproverid INT REFERENCES users(id)
);
📌 4. API Controllers

Library Controller (controllers/library_controller.go)

package controllers

import (
    "encoding/json"
    "library-management/config"
    "library-management/models"
    "net/http"
)

func CreateLibrary(w http.ResponseWriter, r *http.Request) {
    var library models.Library
    err := json.NewDecoder(r.Body).Decode(&library)
    if err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    var exists bool
    queryCheck := `SELECT EXISTS (SELECT 1 FROM library WHERE name=$1)`
    err = config.DB.QueryRow(queryCheck, library.Name).Scan(&exists)
    if err != nil {
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    }
    if exists {
        http.Error(w, "Library already exists", http.StatusConflict)
        return
    }

    query := `INSERT INTO library (name) VALUES ($1) RETURNING id`
    err = config.DB.QueryRow(query, library.Name).Scan(&library.ID)
    if err != nil {
        http.Error(w, "Error creating library", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(library)
}
Book Controller (controllers/book_controller.go)

package controllers

import (
    "encoding/json"
    "library-management/config"
    "library-management/models"
    "net/http"
)

func AddBook(w http.ResponseWriter, r *http.Request) {
    var book models.Book
    err := json.NewDecoder(r.Body).Decode(&book)
    if err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    query := `INSERT INTO bookinventory (isbn, title, authors, publisher, version, totalcopies, availablecopies) 
              VALUES ($1, $2, $3, $4, $5, $6, $7)`
    _, err = config.DB.Exec(query, book.ISBN, book.Title, book.Authors, book.Publisher, book.Version, book.TotalCopies, book.AvailableCopies)
    if err != nil {
        http.Error(w, "Error inserting book", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(book)
}
📌 5. API Routes

routes/routes.go
package routes

import (
    "library-management/controllers"
    "net/http"

    "github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
    router := mux.NewRouter()

    router.HandleFunc("/libraries", controllers.CreateLibrary).Methods("POST")
    router.HandleFunc("/books", controllers.AddBook).Methods("POST")

    return router
}
📌 6. Main File

main.go
package main

import (
    "fmt"
    "library-management/config"
    "library-management/routes"
    "net/http"
)

func main() {
    config.ConnectDB()
    router := routes.SetupRoutes()

    fmt.Println("Server is running on port 8080...")
    http.ListenAndServe(":8080", router)
}
✅ Final Steps

Run Database Migration
psql -U youruser -d library -f schema.sql
Start the API
go run main.go
