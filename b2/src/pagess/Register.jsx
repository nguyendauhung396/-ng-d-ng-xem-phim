import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";


const Register = () => {
  // Dùng để chuyển trang
  const navigate = useNavigate();

  // Lưu tên người dùng
  const [name, setName] = useState("");

  // Lưu email
  const [email, setEmail] = useState("");

  // Lưu mật khẩu
  const [password, setPassword] = useState("");

  // Lưu loại tài khoản
  // patient hoặc doctor
  const [role, setRole] = useState("patient");

  // Hàm đăng ký
  async function handleRegister() {
    try {
      // Nếu chọn doctor thì lưu vào doctors
      // Nếu chọn patient thì lưu vào patients
      const api =
        role === "doctor"
          ? "http://localhost:3000/doctors"
          : "http://localhost:3000/patients";

      // Gửi dữ liệu lên JSON Server
      const response = await fetch(api, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      // Nếu đăng ký thành công
      if (response.ok) {
        // Lấy dữ liệu vừa tạo
        const user = await response.json();

        // Giả lập đăng nhập
        localStorage.setItem("token", "abc123");

        // Lưu role để phân quyền
        localStorage.setItem("role", role);

        // Lưu thông tin user
        localStorage.setItem("user", JSON.stringify(user));

        alert("Đăng ký thành công");

        // Nếu là doctor
        if (role === "doctor") {
          navigate("/doctor/dashboard");
        } else {
          // Nếu là patient
          navigate("/patient/dashboard");
        }
      }
    } catch (error) {
      console.log(error);

      alert("Đăng ký thất bại");
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">
        Register
      </h1>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full border p-3 rounded-lg mb-4"
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
      </select>

      <button
        onClick={handleRegister}
        className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
      >
        Register
      </button>

      <p className="text-center mt-4">
        Đã có tài khoản?
        <Link
          to="/login"
          className="text-blue-500 font-semibold ml-1"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  </div>
);
};

export default Register;
