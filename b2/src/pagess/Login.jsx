import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {

  const response = await fetch(
    "http://localhost:3000/users"
  );

  const users = await response.json();

  const user = users.find(
    (u) =>
      (u.email === account ||
       u.name === account) &&
      u.password === password
  );

  if (!user) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  localStorage.setItem(
    "token",
    "abc123"
  );

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );

  localStorage.setItem(
    "role",
    user.role
  );

  switch(user.role) {

    case "admin":
      navigate("/admin/dashboard");
      break;

    case "doctor":
      navigate("/doctor/dashboard");
      break;

    case "patient":
      navigate("/patient/dashboard");
      break;

    default:
      navigate("/login");
  }
}

  return (
<div className="min-h-screen flex items-center justify-center bg-gray-100">
  <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
    <h1 className="text-3xl font-bold text-center mb-6">
      Login
    </h1>

    <input
      type="text"
      placeholder="Email hoặc Name"
      value={account}
      onChange={(e) => setAccount(e.target.value)}
      className="w-full border p-3 rounded-lg mb-4"
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full border p-3 rounded-lg mb-4"
    />

    <button
      onClick={handleLogin}
      className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
    >
      Login
    </button>

    <p className="text-center mt-4">
      Chưa có tài khoản?
      <Link
        to="/"
        className="text-blue-500 font-semibold ml-1"
      >
        Đăng ký ngay
      </Link>
    </p>
  </div>
</div>
  );
};

export default Login;
