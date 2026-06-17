// ==========================
// IMPORT
// ==========================
import { useState, useEffect } from "react";

const Header = () => {

  // ==========================
  // API URL
  // ==========================
  const API_URL = "http://localhost:3000/doctors";

  // ==========================
  // STATE DỮ LIỆU
  // ==========================
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [address, setAddress] = useState("");

  // ==========================
  // STATE GIAO DIỆN
  // ==========================
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================
  // LẤY DANH SÁCH BÁC SĨ
  // ==========================
  async function handleSearch() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      const data = await response.json();

      setDoctors(data);

    } catch (error) {

      setError("Không thể kết nối server");

    } finally {

      setLoading(false);

    }
  }

  // ==========================
  // TÌM KIẾM BÁC SĨ
  // ==========================
  function filterDoctors() {
    return doctors.filter((doctor) => {

      const search = searchTerm.toLowerCase().trim();

      if (search === "") return true;

      return (
        doctor.name.toLowerCase().includes(search) ||
        doctor.specialty.toLowerCase().includes(search) ||
        doctor.address.toLowerCase().includes(search)
      );
    });
  }

  // ==========================
  // CHẠY KHI MỞ TRANG
  // ==========================
  useEffect(() => {

    handleSearch();

// đưa dữ liệu vào localstorage
    const savedName = localStorage.getItem("name");
    const savedSpecialty = localStorage.getItem("specialty");
    const savedAddress = localStorage.getItem("address");

    if (savedName) setName(savedName);
    if (savedSpecialty) setSpecialty(savedSpecialty);
    if (savedAddress) setAddress(savedAddress);

  }, []);

  // ==========================
  // DANH SÁCH ĐÃ LỌC
  // ==========================
  const filteredDoctors = filterDoctors();

  // ==========================
  // CHỌN BÁC SĨ ĐỂ SỬA
  // ==========================
  function startEdit(doctor) {

    setEditingId(doctor.id);

    setName(doctor.name);
    setSpecialty(doctor.specialty);
    setAddress(doctor.address);

    setIsOpen(true);
  }

  // ==========================
  // RESET FORM
  // ==========================
  function resetForm() {

    setName("");
    setSpecialty("");
    setAddress("");
// xoá hết ở ô chỉnh sửa 
    setEditingId(null);

    localStorage.removeItem("name");
    localStorage.removeItem("specialty");
    localStorage.removeItem("address");
  }

  // ==========================
  // THÊM HOẶC SỬA BÁC SĨ
  // ==========================
  async function saveDoctor(e) {

    e.preventDefault();

    // Validate
    if (
      !name.trim() ||
      !specialty.trim() ||
      !address.trim()
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const doctorData = {
      name,
      specialty,
      address,
    };

    try {

      // THÊM MỚI
      if (editingId === null) {

        await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(doctorData),
        });

        alert("Thêm bác sĩ thành công!");

      }

      // SỬA
      else {

        await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(doctorData),
        });

        alert("Sửa bác sĩ thành công!");

      }

      await handleSearch();

      resetForm();

      setIsOpen(false);

    } catch (error) {

      console.error(error);

      alert("Có lỗi xảy ra!");

    }
  }

  // ==========================
  // XOÁ BÁC SĨ
  // ==========================
  async function deleteDoctor(id) {

    if (!window.confirm("Bạn có chắc muốn xoá bác sĩ này?")) {
      return;
    }

    try {

      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      alert("Xoá bác sĩ thành công!");

      await handleSearch();

    } catch (error) {

      console.error(error);

      alert("Xoá bác sĩ thất bại!");

    }
  }

  // ==========================
  // LOADING UI
  // ==========================
  if (loading) {
    return <h2>Đang tải dữ liệu...</h2>;
  }

  // ==========================
  // ERROR UI
  // ==========================
  if (error) {
    return <h2>{error}</h2>;
  }

  // ==========================
  // JSX UI
  // ==========================
  return (



    <div>
      {isOpen && (
        <form onSubmit={saveDoctor}>
          <h1>Nhập thông tin bác sĩ</h1>
          <h2>Tên bác sĩ</h2>
          <input
            type="text"
            placeholder="Nhập tên bác sĩ..."
            value={name}
            onChange={(e) => {
            setName(e.target.value);
            localStorage.setItem("name", e.target.value);
          }}
          />

          <h2>Chuyên khoa</h2>
          <input
            type="text"
            placeholder="Nhập chuyên khoa..."
            value={specialty}
            onChange={(e) => {
            setSpecialty(e.target.value);
            localStorage.setItem("specialty", e.target.value);
            }}
          />

          <h2>Địa chỉ</h2>
          <input
            type="text"
            placeholder="Nhập địa chỉ..."
            value={address}
            onChange={(e) => {
            setAddress(e.target.value);
            localStorage.setItem("address", e.target.value);
            }}
          />

          <button type="submit">{editingId ? "Lưu" : "Thêm"}</button>
          <button type="button" onClick={() => {setIsOpen(false);
            setName("");
            setSpecialty("");
            setAddress("");
            setEditingId(null);
          }}>
            Đóng
          </button>
        </form>
      )}

      <button onClick={() => setIsOpen(true)}>Thêm bác sĩ mới</button>

      <h2>tìm kiếm bác sĩ</h2>
      <input
        type="text"
        placeholder="tìm kiếm theo tên, chuyên khoa, địa chỉ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />



{/* hiển thị danh sách bác sĩ  */}


{
  filteredDoctors.length === 0 ? (

    <p>Không tìm thấy bác sĩ nào</p>

  ) : (

    filteredDoctors.map((doctor) => (
      <div key={doctor.id}>
        <h3>{doctor.name}</h3>
        <p>{doctor.specialty}</p>
        <p>{doctor.address}</p>

        <button onClick={() => deleteDoctor(doctor.id)}>
          Xoá bác sĩ
        </button>

        <button onClick={() => startEdit(doctor)}>
          Sửa bác sĩ
        </button>
      </div>
    ))

  )
}
    </div>
  );



};

export default Header;
