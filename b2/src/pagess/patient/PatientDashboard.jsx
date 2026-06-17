import { useEffect, useState } from "react";

const PatientDashboard = () => {

  const [appointments, setAppointments] =
    useState([]);

  useEffect(() => {

    fetch(
      "http://localhost:3000/appointments"
    )
      .then(res => res.json())
      .then(data => setAppointments(data));

  }, []);

  return (
    <>
      <h1>Patient Dashboard</h1>

      <h3>
        Số lịch hẹn:
        {appointments.length}
      </h3>
    </>
  );
};

export default PatientDashboard;