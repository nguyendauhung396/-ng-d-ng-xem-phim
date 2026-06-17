import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {

  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const doctors =
      await fetch("http://localhost:3000/doctors")
      .then(res => res.json());

    const patients =
      await fetch("http://localhost:3000/patients")
      .then(res => res.json());

    const appointments =
      await fetch("http://localhost:3000/appointments")
      .then(res => res.json());

    setDoctorCount(doctors.length);
    setPatientCount(patients.length);
    setAppointmentCount(appointments.length);
  }

  return (
    <>
    
            
            <Link to="/"> Thoát </Link>
       
      <h1>Admin Dashboard</h1>

      <h3>Tổng bác sĩ: {doctorCount}</h3>

      <h3>Tổng bệnh nhân: {patientCount}</h3>

      <h3>Tổng lịch hẹn: {appointmentCount}</h3>
      
              <Link to="/admin/doctors">Thêm bác sĩ</Link>
            


    </>
  );
};

export default AdminDashboard;