import { Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";


import Login from "./pagess/Login";
import Register from "./pagess/Register";

import AdminDashboard from "./pagess/admin/AdminDashboard";
import DoctorManagement from "./pagess/admin/DoctorManagement";

import DoctorDashboard from "./pagess/doctor/DoctorDashboard";
import AppointmentList from "./pagess/doctor/AppointmentList";

import PatientDashboard from "./pagess/patient/PatientDashboard";
import BookAppointment from "./pagess/patient/BookAppointment";

import AdminLayout from "./layoutss/AdminLayout";
import DoctorLayout from "./layoutss/DoctorLayout";
import PatientLayout from "./layoutss/PatientLayout";

import ProtectedRoute from "./routerss/ProtectedRoute";

function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/"
        element={<Register />}
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="doctors"
          element={<DoctorManagement />}
        />
      </Route>

      <Route
        path="/doctor"
        element={
          <ProtectedRoute>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={<DoctorDashboard />}
        />

        <Route
          path="appointments"
          element={<AppointmentList />}
        />
      </Route>

      <Route
        path="/patient"
        element={
          <ProtectedRoute>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={<PatientDashboard />}
        />

        <Route
          path="book"
          element={<BookAppointment />}
        />
      </Route>

    </Routes>
  );
}

export default App;
