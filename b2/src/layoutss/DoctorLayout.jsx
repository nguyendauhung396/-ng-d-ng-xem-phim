import React from 'react'
import { Outlet } from "react-router-dom";

const DoctorLayout = () => {
  return (
    <div>
      <nav>
        <h2>Doctor Menu</h2>

        <ul>
          <li>Dashboard</li>
          <li>Appointments</li>
          <li>Logout</li>
        </ul>
      </nav>

      <hr />

      <Outlet />
    </div>
  )
}

export default DoctorLayout
