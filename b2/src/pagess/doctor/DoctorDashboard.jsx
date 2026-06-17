import { useEffect, useState } from "react";

const DoctorDashboard = () => {

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {

    const response = await fetch(
      "http://localhost:3000/appointments"
    );

    const data = await response.json();

    setAppointments(data);
  }

  return (
    <>
      <h1>Doctor Dashboard</h1>

      <h3>
        Tổng lịch hẹn:
        {appointments.length}
      </h3>
    </>
  );
};

export default DoctorDashboard;