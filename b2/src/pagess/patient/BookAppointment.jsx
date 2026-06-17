import { useEffect, useState } from "react";

const BookAppointment = () => {

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const doctorData =
      await fetch("http://localhost:3000/doctors")
      .then(res => res.json());

    const appointmentData =
      await fetch("http://localhost:3000/appointments")
      .then(res => res.json());

    setDoctors(doctorData);
    setAppointments(appointmentData);
  }

  async function handleBook() {

    if (!doctorId || !date || !time) {
      alert("Nhập đầy đủ thông tin");
      return;
    }

    const appointment = {
      doctorId: Number(doctorId),
      patientId: 1,
      date,
      time,
      status: "Pending"
    };

    await fetch(
      "http://localhost:3000/appointments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointment)
      }
    );

    alert("Đặt lịch thành công");

    setDoctorId("");
    setDate("");
    setTime("");

    loadData();
  }

  async function deleteAppointment(id) {

    if (!window.confirm("Xóa lịch hẹn?")) {
      return;
    }

    await fetch(
      `http://localhost:3000/appointments/${id}`,
      {
        method: "DELETE"
      }
    );

    loadData();
  }

  function getDoctorName(id) {

    const doctor =
      doctors.find(
        d => d.id === id
      );

    return doctor?.name;
  }

  return (
    <div>

      <h1>Book Appointment</h1>

      <h3>Chọn bác sĩ</h3>

      <select
        value={doctorId}
        onChange={(e) =>
          setDoctorId(e.target.value)
        }
      >

        <option value="">
          Chọn bác sĩ
        </option>

        {
          doctors.map(doctor => (

            <option
              key={doctor.id}
              value={doctor.id}
            >
              {doctor.name}
            </option>

          ))
        }

      </select>

      <br /><br />

      <input
        type="date"
        value={date}
        onChange={(e) =>
          setDate(e.target.value)
        }
      />

      <br /><br />

      <input
        type="time"
        value={time}
        onChange={(e) =>
          setTime(e.target.value)
        }
      />

      <br /><br />

      <button onClick={handleBook}>
        Đặt lịch
      </button>

      <hr />

      <h2>Lịch đã đặt</h2>

      {
        appointments.map(item => (

          <div key={item.id}>

            <h4>
              {getDoctorName(item.doctorId)}
            </h4>

            <p>
              Ngày: {item.date}
            </p>

            <p>
              Giờ: {item.time}
            </p>

            <p>
              Trạng thái: {item.status}
            </p>

            <button
              onClick={() =>
                deleteAppointment(item.id)
              }
            >
              Xóa lịch
            </button>

            <hr />

          </div>

        ))
      }

    </div>
  );
};

export default BookAppointment;