import React, { useState } from "react";
import AdminSidebar from "../../Components/SidebarAdmin"; // Import the sidebar
import "../../Styles/Admin/AdminRemoveBook.scss"; // Ensure correct SCSS path

const AdminRemoveBook = () => {
  const [isbn, setIsbn] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleRemoveBook = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setError(""); // Clear previous errors
    setLoading(true); // Set loading to true while request is processing

    try {
      const response = await fetch(`http://localhost:8080/api/book/${isbn}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ libraryid: parseInt(libraryId) }),
      });

      const data = await response.json();
      setLoading(false); // Stop loading state

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove book.");
      }

      setMessage(data.message);
      setIsbn("");
      setLibraryId("");
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="admin-remove-book-container">
      <AdminSidebar />
      <div className="content">
        <h2>Remove a Book from Library</h2>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <form onSubmit={handleRemoveBook}>
          <div className="form-group">
            <label htmlFor="isbn">Book ISBN:</label>
            <input
              type="text"
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Enter ISBN of the book"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="libraryId">Library ID:</label>
            <input
              type="number"
              id="libraryId"
              value={libraryId}
              onChange={(e) => setLibraryId(e.target.value)}
              placeholder="Enter Library ID"
              required
            />
          </div>

          <button type="submit" className="rmv-btn" disabled={loading}>
            {loading ? "Removing..." : "Remove Book"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRemoveBook;
