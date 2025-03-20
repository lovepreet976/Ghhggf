import React, { useState } from "react";
import AdminSidebar from "../../Components/SidebarAdmin"; // Import the sidebar component
import "../../Styles/Admin/AdminAddBook.scss";

const AdminAddBook = () => {
  // State variables for form fields
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [publisher, setPublisher] = useState("");
  const [version, setVersion] = useState("");
  const [totalCopies, setTotalCopies] = useState("");
  const [libraryID, setLibraryID] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const bookData = {
      ISBN: isbn,
      Title: title,
      Authors: authors,
      Publisher: publisher,
      Version: version,
      TotalCopies: parseInt(totalCopies), // Ensure it's a number
      LibraryID: parseInt(libraryID), // Ensure it's a number
    };

    try {
      const token = localStorage.getItem("token"); // Fetch token from localStorage

      const response = await fetch("http://localhost:8080/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add the book.");
      }

      setSuccessMessage(data.message); // Show success message
      setIsbn("");
      setTitle("");
      setAuthors("");
      setPublisher("");
      setVersion("");
      setTotalCopies("");
      setLibraryID("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-book-container">
      <AdminSidebar />
      <div className="content">
        <h2>Add a New Book</h2>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
  <div className="form-container">
    <div className="form-group">
      <label htmlFor="isbn">ISBN:</label>
      <input type="text" id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
    </div>
    <div className="form-group">
      <label htmlFor="title">Title:</label>
      <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
    </div>
    <div className="form-group">
      <label htmlFor="authors">Authors:</label>
      <input type="text" id="authors" value={authors} onChange={(e) => setAuthors(e.target.value)} required />
    </div>
    <div className="form-group">
      <label htmlFor="publisher">Publisher:</label>
      <input type="text" id="publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} required />
    </div>
    <div className="form-group">
      <label htmlFor="version">Version:</label>
      <input type="text" id="version" value={version} onChange={(e) => setVersion(e.target.value)} required />
    </div>
    <div className="form-group">
      <label htmlFor="totalCopies">Total Copies:</label>
      <input type="number" id="totalCopies" value={totalCopies} onChange={(e) => setTotalCopies(e.target.value)} required />
    </div>
    <div className="form-group">
      <label htmlFor="libraryID">Library ID:</label>
      <input type="number" id="libraryID" value={libraryID} onChange={(e) => setLibraryID(e.target.value)} required />
    </div>
    <div className="submit-container">
      <button type="submit" className="add-btn" disabled={loading}>
        {loading ? "Adding..." : "Add Book"}
      </button>
    </div>
  </div>
</form>

      </div>
    </div>
  );
};

export default AdminAddBook;
