import React from 'react'
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
     <div>
      <nav>
        <h2>Admin Menu</h2>

        <ul>
          <li>Dashboard</li>
          <li>Doctors</li>
          <li>Patients</li>
          <li>Logout</li>
        </ul>
      </nav>

      <hr />

      <Outlet />
    </div>
  )
}

export default AdminLayout
