import React, { useState } from "react";
import AdminSidebar from "../../Components/SidebarAdmin";  // Import the sidebar component
import "../../Styles/Admin/AdminIssue.scss"; 

const AdminIssue = () => {
  const [isbn, setIsbn] = useState("");
  const [userId, setUserId] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Assuming this is where you handle the request to issue a book
    const requestBody = {
      isbn: isbn,
      userId: userId,
      libraryId: libraryId,
    };

    // Make an API call to issue a book (for example using fetch)
    fetch("/api/issue/book/" + isbn, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setErrorMessage(data.error);
          setSuccessMessage("");
        } else {
          setSuccessMessage("Book issued successfully!");
          setErrorMessage("");
        }
      })
      .catch((err) => {
        setErrorMessage("An error occurred while issuing the book.");
        setSuccessMessage("");
      });
  };

  return (
    <div className="admin-issue-container">
      <AdminSidebar />
      <div className="content">
        <h2>Issue a Book</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="isbn">Book ISBN</label>
            <input
              type="text"
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter book ISBN"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="libraryId">Library ID</label>
            <input
              type="text"
              id="libraryId"
              value={libraryId}
              onChange={(e) => setLibraryId(e.target.value)}
              placeholder="Enter library ID"
              required
            />
          </div>

          <button type="submit" className="iss-btn">Issue Book</button>
        </form>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>
    </div>
  );
};

export default AdminIssue;