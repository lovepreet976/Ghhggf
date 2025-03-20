// 🔍 Search Books by Title, Author, Publisher
package controllers

import (
	"library-management/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SearchBooks(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
			return
		}

		var userLibraries []uint
		if err := db.Table("user_libraries").Where("user_id = ?", userID).Pluck("library_id", &userLibraries).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch user libraries"})
			return
		}

		if len(userLibraries) == 0 {
			c.JSON(http.StatusOK, gin.H{"books": []gin.H{}})
			return
		}

		title := c.Query("title")
		author := c.Query("author")
		publisher := c.Query("publisher")

		var books []models.Book
		query := db.Where("library_id IN (?)", userLibraries)

		if title != "" {
			query = query.Where("title ILIKE ?", "%"+title+"%")
		}
		if author != "" {
			query = query.Where("authors ILIKE ?", "%"+author+"%")
		}
		if publisher != "" {
			query = query.Where("publisher ILIKE ?", "%"+publisher+"%")
		}

		if err := query.Select("isbn, title, authors, publisher, available_copies, library_id").Find(&books).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error searching books"})
			return
		}

		response := make([]gin.H, 0, len(books))
		for _, book := range books {
			authors := book.Authors
			if authors == "" {
				authors = "Unknown"
			}

			bookData := gin.H{
				"isbn":             book.ISBN,
				"title":            book.Title,
				"author":           authors,
				"publisher":        book.Publisher,
				"available_copies": book.AvailableCopies,
				"library_id":       book.LibraryID,
			}

			// Check if the book is unavailable (no copies left)
			if book.AvailableCopies == 0 {
				var nextAvailableDate time.Time
				var issue models.IssueRegistry

				// Check if there is an outstanding issue with this book
				if err := db.Where("isbn = ? AND return_date IS NULL", book.ISBN).
					Order("expected_return_date ASC").
					First(&issue).Error; err == nil {
					// If there is an issue, get the next expected return date
					nextAvailableDate = time.Unix(issue.ExpectedReturnDate, 0)
					bookData["next_available_date"] = nextAvailableDate.Format("2006-01-02 15:04:05")
				} else {
					// If no issue found, the next available date is unknown
					bookData["next_available_date"] = "Unknown"
				}
			} else {
				// If available, do not show the next available date
				bookData["next_available_date"] = "Available"
			}

			// Append the book data to the response
			response = append(response, bookData)
		}

		c.JSON(http.StatusOK, gin.H{"books": response})
	}
}

func RequestIssue(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			BookID    string `json:"isbn" binding:"required"`
			LibraryID uint   `json:"libraryid" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
			return
		}

		var book models.Book
		if err := db.Where("isbn = ? AND library_id = ?", input.BookID, input.LibraryID).First(&book).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Book not found in the specified library"})
			return
		}

		if book.AvailableCopies == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Book not available for issue"})
			return
		}

		var userLibrary models.UserLibrary
		if err := db.Where("user_id = ? AND library_id = ?", userID, input.LibraryID).First(&userLibrary).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "You can only request books from libraries you are registered in"})
			return
		}

		var existingRequest models.RequestEvent
		if err := db.Where("reader_id = ? AND book_id = ? AND library_id = ? AND approval_date IS NULL", userID, input.BookID, input.LibraryID).First(&existingRequest).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "You already have a pending request for this book in this library"})
			return
		}

		requestDate := time.Now()
		request := models.RequestEvent{
			BookID:       input.BookID,
			LibraryID:    input.LibraryID,
			ReaderID:     userID.(uint),
			RequestDate:  requestDate.Unix(),
			ApprovalDate: nil,
			ApproverID:   nil,
			RequestType:  "issue",
		}

		if err := db.Create(&request).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create issue request"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Issue request submitted", "request": request})
	}
}

func StatusIssue(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the user ID from the token (already authenticated)
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
			return
		}

		// Retrieve the request for this user. We are assuming the user is only associated with one request.
		var request models.RequestEvent
		if err := db.Where("reader_id = ?", userID).First(&request).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "No request found for this user"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve request status"})
			return
		}

		// Return the request status
		c.JSON(http.StatusOK, gin.H{
			"request_id":    request.ID,
			"book_id":       request.BookID,
			"library_id":    request.LibraryID,
			"reader_id":     request.ReaderID,
			"request_date":  request.RequestDate,
			"approval_date": request.ApprovalDate,
			"status": func() string {
				if request.ApprovalDate != nil {
					return "Approved"
				}
				return "Pending"
			}(),
		})
	}
}
