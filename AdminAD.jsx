import React, { useEffect, useState } from "react";
import AdminSidebar from "../../Components/SidebarAdmin";  // Sidebar component
import axios from "axios";
import "../../Styles/Admin/AdminAD.scss";  

const API_BASE_URL = "http://localhost:8080/api";  // Backend API base URL

const AdminAD = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");  // Get authentication token

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data.requests);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching issue requests", error);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/issue/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Request Approved!");
      fetchRequests();  // Refresh list
    } catch (error) {
      console.error("Error approving request", error);
      alert("Failed to approve request");
    }
  };

  const handleDisapprove = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/issue/disapprove/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Request Disapproved!");
      fetchRequests();  // Refresh list
    } catch (error) {
      console.error("Error disapproving request", error);
      alert("Failed to disapprove request");
    }
  };

  return (
    <div className="admin-requests-container">
      <AdminSidebar />
      <div className="content">
        <h2>Issue Requests</h2>
        <div className="requests-table">
          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book ID</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.book_id}</td>
                    <td>{request.user_id}</td>
                    <td>
                      {request.approval_date ? (
                        <span className="approved">Approved</span>
                      ) : (
                        <span className="pending">Pending</span>
                      )}
                    </td>
                    <td>
                      {request.approval_date ? (
                        <span className="approved">✔ Approved</span>
                      ) : (
                        <>
                          {/* Ensure buttons are only visible if the request is pending */}
                          <button 
                            className="approve-btn" 
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="disapprove-btn" 
                            onClick={() => handleDisapprove(request.id)}
                          >
                            Disapprove
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAD;