import React, { useEffect, useState } from "react";
import AdminSidebar from "../../Components/SidebarAdmin";
import "../../Styles/Admin/AdminListRequests.scss";

const AdminListRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      console.log("Fetched Requests:", data);
      setRequests(data.requests);
    } catch (err) {
      setError("Failed to fetch requests");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/issue/approve/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Approval failed");

      console.log(`Request ${id} approved`);
      fetchRequests(); // ✅ Refresh data after approval
    } catch (error) {
      alert("Error approving request");
      console.error("Approval error:", error);
    }
  };

  const handleDisapprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/issue/disapprove/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Disapproval failed");

      console.log(`Request ${id} disapproved`);
      fetchRequests(); // ✅ Refresh data after disapproval
    } catch (error) {
      alert("Error disapproving request");
      console.error("Disapproval error:", error);
    }
  };

  const handleIssueBook = async (isbn, userId, libraryId) => {
    try {
        console.log("📤 Sending request with: ", { isbn, userId, libraryId });

        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:8080/api/issue/book/${isbn}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                user_id: Number(userId),
                library_id: Number(libraryId),
            }),
        });

        const data = await response.json();
        console.log("📥 Response received: ", data);

        if (!response.ok) {
            throw new Error(data.error || "Failed to issue book");
        }

        alert("Book issued successfully!");

        // ✅ Update state to reflect issued book
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.book_id === isbn
              ? { ...req, status: "Issued", issued_to: userId, issued_in: libraryId }
              : req
          )
        );
    } catch (error) {
        console.error("❌ Error:", error.message);
        alert(error.message);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="admin-requests-container">
      <AdminSidebar />
      <div className="content">
        <h2>Issue Requests</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : requests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          <div className="request-list">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <h3>Request ID: {request.id}</h3>
                <p><strong>Book ISBN:</strong> {request.book_id}</p>
                <p><strong>User ID:</strong> {request.user_id}</p>
                <p><strong>Request Type:</strong> {request.request_type}</p>
                <p><strong>Request Date:</strong> {formatDate(request.request_date)}</p>
                <p><strong>Status:</strong> 
                  <span className={request.status?.toLowerCase() === "approved" 
                    ? "approved" 
                    : request.status?.toLowerCase() === "disapproved" 
                    ? "disapproved" 
                    : "pending"}>
                    {request.status || "Pending"}
                  </span>
                </p>
                <p><strong>Approval Date:</strong> {formatDate(request.approval_date)}</p>
                <p><strong>Approver ID:</strong> {request.approver_id || "N/A"}</p>

                {/* ✅ Show issued message instead of issue button */}
                {request.status?.toLowerCase() === "issued" ? (
                  <p className="issued-msg">
                    📚 Book issued to <strong>User ID:</strong> {request.issued_to} in <strong>Library ID:</strong> {request.issued_in}
                  </p>
                ) : (
                  <div className="buttons">
                    {/* Approve/Disapprove buttons (Only for Pending requests) */}
                    {request.status?.toLowerCase() === "pending" && (
                      <>
                        <button className="approve-btn" onClick={() => handleApprove(request.id)}>Approve</button>
                        <button className="disapprove-btn" onClick={() => handleDisapprove(request.id)}>Disapprove</button>
                      </>
                    )}

                    {/* Issue Book Button (Only for Approved requests) */}
                    {request.status?.toLowerCase() === "approved" && (
                      <div className="issue-section">
                        <input type="number" placeholder="User ID" id={`user-${request.id}`} />
                        <input type="number" placeholder="Library ID" id={`library-${request.id}`} />
                        <button
                          className="issue-book-btn"
                          onClick={() => {
                            const userId = document.getElementById(`user-${request.id}`).value;
                            const libraryId = document.getElementById(`library-${request.id}`).value;
                            if (userId && libraryId) {
                              handleIssueBook(request.book_id, userId, libraryId);
                            } else {
                              alert("Please enter User ID and Library ID");
                            }
                          }}
                        >
                          Issue Book
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminListRequests;
