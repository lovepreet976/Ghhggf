
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


package config

import (
    "database/sql"
    "fmt"
    "log"

    _ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectDB() {
    var err error
    connStr := "host=localhost user=youruser password=yourpassword dbname=library sslmode=disable"
    
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



3. Models

models/library.go
package models

type Library struct {
    ID   int
    Name string
}
models/user.go
package models

type User struct {
    ID            int
    Name          string
    Email         string
    ContactNumber string
    Role          string
    LibraryID     int
}
models/book.go
package models

type Book struct {
    ISBN           string
    Title          string
    Authors        string
    Publisher      string
    Version        string
    TotalCopies    int
    AvailableCopies int
}
models/request.go
package models

type RequestEvent struct {
    ReqID        int
    BookID       string
    ReaderID     int
    RequestDate  string
    ApprovalDate string
    ApproverID   int
    RequestType  string
}
models/issue.go
package models

type IssueRegistry struct {
    IssueID          int
    ISBN            string
    ReaderID        int
    IssueApproverID int
    IssueStatus     string
    IssueDate       string
    ExpectedReturnDate string
    ReturnDate      string
    ReturnApproverID int
}
📌 4. Controllers

controllers/library_controller.go
package controllers

import (
    "database/sql"
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
controllers/admin_controller.go
package controllers

import (
    "database/sql"
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
controllers/reader_controller.go
package controllers

import (
    "database/sql"
    "encoding/json"
    "library-management/config"
    "library-management/models"
    "net/http"
)

func SearchBook(w http.ResponseWriter, r *http.Request) {
    title := r.URL.Query().Get("title")

    query := `SELECT isbn, title, authors, publisher, version, totalcopies, availablecopies FROM bookinventory WHERE title ILIKE $1`
    rows, err := config.DB.Query(query, "%"+title+"%")
    if err != nil {
        http.Error(w, "Error fetching book", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var books []models.Book
    for rows.Next() {
        var book models.Book
        err := rows.Scan(&book.ISBN, &book.Title, &book.Authors, &book.Publisher, &book.Version, &book.TotalCopies, &book.AvailableCopies)
        if err != nil {
            http.Error(w, "Error scanning book", http.StatusInternalServerError)
            return
        }
        books = append(books, book)
    }

    json.NewEncoder(w).Encode(books)
}










