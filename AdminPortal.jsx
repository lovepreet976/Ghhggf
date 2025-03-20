import React from "react";
import AdminSidebar from "../../Components/SidebarAdmin";  // Import the sidebar component
import "../../Styles/Portal.scss"


const AdminPortal = () => {
  return (
    <div className="portal-container">
      <AdminSidebar />
      <div className="content">
        {/* Content of your owner portal page */}
        <h5>Welcome to the Admin Portal</h5>
        {/* You can include specific components for Registering Owners, Admins, etc., here */}
      </div>
    </div>
  );
};

export default AdminPortal;