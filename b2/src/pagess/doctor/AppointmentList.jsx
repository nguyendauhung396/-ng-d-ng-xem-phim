import { useEffect, useState } from "react";

const AppointmentList = () => {

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const appointmentData =
      await fetch("http://localhost:3000/appointments")
      .then(res => res.json());

    const doctorData =
      await fetch("http://localhost:3000/doctors")
      .then(res => res.json());

    const patientData =
      await fetch("http://localhost:3000/patients")
      .then(res => res.json());

    setAppointments(appointmentData);
    setDoctors(doctorData);
    setPatients(patientData);
  }

  function getDoctorName(id) {

    const doctor =
      doctors.find(d => d.id === id);

    return doctor?.name;
  }

  function getPatientName(id) {

    const patient =
      patients.find(p => p.id === id);

    return patient?.name;
  }

  return (
    <>
      <h1>Appointment List</h1>

      {appointments.map(item => (

        <div key={item.id}>

          <h3>
            {getPatientName(item.patientId)}
          </h3>

          <p>
            Bác sĩ:
            {getDoctorName(item.doctorId)}
          </p>

          <p>{item.date}</p>

          <p>{item.time}</p>

          <p>{item.status}</p>

          <hr />

        </div>

      ))}
    </>
  );
};

export default AppointmentList;