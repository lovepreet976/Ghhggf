import React, { useState } from "react";
import AdminSidebar from "../../Components/SidebarAdmin";
import "../../Styles/Admin/AdminUpdateBook.scss";

const AdminUpdateBook = () => {
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

  // Handle book update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!isbn) {
      setErrorMessage("ISBN is required.");
      setLoading(false);
      return;
    }

    const updatedBook = {
      Title: title,
      Authors: authors,
      Publisher: publisher,
      Version: version,
      TotalCopies: totalCopies ? parseInt(totalCopies) : undefined,
      LibraryID: libraryID ? parseInt(libraryID) : undefined,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:8080/api/book/${isbn}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBook),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update the book.");
      }

      setSuccessMessage("Book updated successfully.");
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
    <div className="admin-update-book-container">
      <AdminSidebar />
      <div className="content">
        <h2>Update Book Details</h2>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleUpdate}>
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="isbn">ISBN (Required):</label>
              <input
                type="text"
                id="isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="authors">Authors:</label>
              <input
                type="text"
                id="authors"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="publisher">Publisher:</label>
              <input
                type="text"
                id="publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="version">Version:</label>
              <input
                type="text"
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="totalCopies">Total Copies:</label>
              <input
                type="number"
                id="totalCopies"
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="libraryID">Library ID:</label>
              <input
                type="number"
                id="libraryID"
                value={libraryID}
                onChange={(e) => setLibraryID(e.target.value)}
              />
            </div>
            <div className="submit-container">
              <button type="submit" className="update-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Book"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUpdateBook;
