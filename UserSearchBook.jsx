import React, { useEffect, useState } from "react";
import axios from "axios";
import UserSidebar from "../../Components/SidebarUser";
import "../../Styles/User/UserSearchBook.scss";

const UserSearchBooks = () => {
  const [searchParams, setSearchParams] = useState({
      title: "",
      author: "",
      publisher: "",
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
      fetchAllBooks(); // Fetch all books on mount
  }, []);

  const fetchAllBooks = async () => {
      setLoading(true);
      setError("");

      try {
          const token = localStorage.getItem("token");
          if (!token) {
              setError("No token found. Please log in again.");
              setLoading(false);
              return;
          }

          const response = await axios.get("http://localhost:8080/api/books/search", {
              headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data && response.data.books) {
              setBooks(response.data.books);
          } else {
              setBooks([]);
              setError("No books found.");
          }
      } catch (err) {
          setError("Failed to fetch books. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const handleChange = (e) => {
      setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
      e.preventDefault();
      setError("");
      setSearched(true);
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
      }

      // Prepare query params
      const params = {};
      if (searchParams.title) params.title = searchParams.title;
      if (searchParams.author) params.author = searchParams.author;
      if (searchParams.publisher) params.publisher = searchParams.publisher;

      // If no search params, fetch all books
      if (Object.keys(params).length === 0) {
          fetchAllBooks();
          return;
      }

      try {
          const response = await axios.get("http://localhost:8080/api/books/search", {
              params, // Sending the search parameters if present
              headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data && response.data.books) {
              setBooks(response.data.books);
          } else {
              setBooks([]);
              setError("No books found for the given search criteria.");
          }
      } catch (err) {
          setError("Failed to fetch books. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  return (
      <div className="search-books-container">
          <UserSidebar />

          <div className="content">
              <h2>Search for Books</h2>

              <form className="search-form" onSubmit={handleSearch}>
                  <div className="input-group">
                      <label>Title:</label>
                      <input
                          type="text"
                          name="title"
                          value={searchParams.title}
                          onChange={handleChange}
                          placeholder="Enter book title"
                      />
                  </div>

                  <div className="input-group">
                      <label>Author:</label>
                      <input
                          type="text"
                          name="author"
                          value={searchParams.author}
                          onChange={handleChange}
                          placeholder="Enter author's name"
                      />
                  </div>

                  <div className="input-group">
                      <label>Publisher:</label>
                      <input
                          type="text"
                          name="publisher"
                          value={searchParams.publisher}
                          onChange={handleChange}
                          placeholder="Enter publisher"
                      />
                  </div>

                  <button type="submit" className="search-btn">Search</button>
              </form>

              {loading && (
                  <div className="loading">
                      <div className="spinner"></div>
                      <p>Loading...</p>
                  </div>
              )}

              {error && <p className="error-message">{error}</p>}

              {searched && books.length === 0 && !loading && (
                  <p className="no-results">No books found for the given search criteria.</p>
              )}

              {books.length > 0 && (
                  <div className="results">
                      <table>
                          <thead>
                              <tr>
                                  <th>ISBN</th>
                                  <th>Title</th>
                                  <th>Author</th>
                                  <th>Publisher</th>
                                  <th>Available Copies</th>
                                  <th>Next Available Date</th>
                                  <th>Library ID</th>
                              </tr>
                          </thead>
                          <tbody>
                              {books.map((book) => (
                                  <tr key={book.isbn}>
                                      <td>{book.isbn}</td>
                                      <td>{book.title}</td>
                                      <td>{book.author || "Unknown"}</td>
                                      <td>{book.publisher || "Unknown"}</td>
                                      <td>
                                          {book.available_copies > 0 ? (
                                              <span className="available">Available</span>
                                          ) : (
                                              <span className="unavailable">
                                                  {book.next_available_date !== "Unknown" ? book.next_available_date : "Not Available"}
                                              </span>
                                          )}
                                      </td>
                                      <td>
                                          {book.next_available_date && book.next_available_date !== "Unknown" ? (
                                              <span>{book.next_available_date}</span>
                                          ) : (
                                              <span>Not Available</span>
                                          )}
                                      </td>
                                      <td>{book.library_id}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      </div>
  );
};

export default UserSearchBooks;
