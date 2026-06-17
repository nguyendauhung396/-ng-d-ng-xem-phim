import React from 'react'
import { Outlet } from "react-router-dom";

const PatientLayout = () => {
  return (
    <div>
      <nav>
        <h2>Patient Menu</h2>

        <ul>
          <li>Dashboard</li>
          <li>Book Appointment</li>
          <li>History</li>
          <li>Logout</li>
        </ul>
      </nav>

      <hr />

      <Outlet />
    </div>
  )
}

export default PatientLayout
