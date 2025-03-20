import React, { useEffect, useState } from 'react';
import "../../Styles/Details.scss";
import AdminSidebar from "../../Components/SidebarAdmin.jsx"; 

function AdminDetails() {
  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching Admin Details from LocalStorage
    const details = JSON.parse(localStorage.getItem('userDetails'));

    if (!details) {
      console.error('Admin details not found in localStorage');
      return;  // Stop execution if admin details are missing
    }

    setAdminDetails(details);
    setLoading(false);  // No need to wait for API, we can load immediately
  }, []);

  // Loading State
  if (loading) {
    return <div>Loading...</div>;
  }

  // Error if Admin details are not found
  if (!adminDetails) {
    return <div>Admin details not found</div>;
  }

  return (
    <div className="details-container">
      <AdminSidebar />
      <h2>Admin Details</h2>

      {/* Display Admin's Basic Details */}
      <div className="detail">
        <strong>ID:</strong> {adminDetails.ID}
      </div>
      <div className="detail">
        <strong>Name:</strong> {adminDetails.Name}
      </div>
      <div className="detail">
        <strong>Email:</strong> {adminDetails.Email}
      </div>
      <div className="detail">
        <strong>Contact:</strong> {adminDetails.Contact}
      </div>
      <div className="detail">
        <strong>Role:</strong> {adminDetails.Role}
      </div>

      {/* Display Libraries Managed by Admin */}
      {adminDetails.Libraries && adminDetails.Libraries.length > 0 ? (
        <div className="detail">
          <h3>Libraries Managed by Admin</h3>
          <ul>
            {adminDetails.Libraries.map((library, index) => (
              <li key={index}>{library.Name}</li>  
            ))}
          </ul>
        </div>
      ) : (
        <div>No libraries found</div>
      )}
    </div>
  );
}

export default AdminDetails;