"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

type Student = {
  id: number;
  nis: string;
  name: string;
  gender: "Laki-laki" | "Perempuan";
  grade: "X" | "XI" | "XII";
  major: string;
  year: string;
};

type StudentFormData = Omit<Student, "id">;

const initialFormData: StudentFormData = {
  nis: "",
  name: "",
  gender: "Laki-laki",
  grade: "X",
  major: "RPL",
  year: new Date().getFullYear().toString(),
};

export default function StudentAdminDashboard() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      nis: "2024001",
      name: "Ahmad Fadli",
      gender: "Laki-laki",
      grade: "X",
      major: "RPL",
      year: "2024",
    },
    {
      id: 2,
      nis: "2024002",
      name: "Siti Nurhaliza",
      gender: "Perempuan",
      grade: "X",
      major: "TKJ",
      year: "2024",
    },
    {
      id: 3,
      nis: "2024003",
      name: "Budi Santoso",
      gender: "Laki-laki",
      grade: "XI",
      major: "Akuntansi",
      year: "2023",
    },
    {
      id: 4,
      nis: "2024004",
      name: "Dewi Lestari",
      gender: "Perempuan",
      grade: "XI",
      major: "Perhotelan",
      year: "2023",
    },
    {
      id: 5,
      nis: "2024005",
      name: "Eko Prasetyo",
      gender: "Laki-laki",
      grade: "XII",
      major: "Otomotif",
      year: "2022",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      name: student.name,
      gender: student.gender,
      grade: student.grade,
      major: student.major,
      year: student.year,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const field = name as keyof StudentFormData;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((item) =>
          item.id === editingStudent.id ? { ...formData, id: item.id } : item,
        ),
      );
    } else {
      setStudents((prev) => [...prev, { ...formData, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      setStudents((prev) => prev.filter((student) => student.id !== id));
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-pink-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 h-16 flex items-center justify-between px-6 shrink-0 w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-700 flex items-center justify-center font-bold text-white text-xs border border-pink-800">
            ARS
          </div>
          <span className="font-bold text-pink-950 text-lg">
            MVP ARS International School
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-800 font-semibold text-sm border border-pink-200">
            AD
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100 min-h-full flex flex-col justify-between w-full">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-pink-950">Data Siswa</h2>
              <p className="text-sm text-pink-700 mt-1">
                Kelola data siswa SMK MVP ARS International School
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari siswa (nama, NIS, jurusan)..."
                  className="w-full pl-10 pr-4 py-2 bg-pink-50 border border-pink-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <button
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-700 hover:bg-pink-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition"
              >
                <Plus size={18} />
                Tambah Siswa
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-pink-100 w-full">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-pink-100 bg-pink-50 text-pink-800 font-semibold">
                    <th className="py-3.5 px-4">NIS</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Jenis Kelamin</th>
                    <th className="py-3.5 px-4">Kelas</th>
                    <th className="py-3.5 px-4">Jurusan</th>
                    <th className="py-3.5 px-4">Tahun Masuk</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 text-pink-950">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-pink-50 transition"
                      >
                        <td className="py-4 px-4 font-medium">{student.nis}</td>
                        <td className="py-4 px-4">{student.name}</td>
                        <td className="py-4 px-4">{student.gender}</td>
                        <td className="py-4 px-4">{student.grade}</td>
                        <td className="py-4 px-4">
                          <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
                            {student.major}
                          </span>
                        </td>
                        <td className="py-4 px-4">{student.year}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2 text-pink-600">
                            <button
                              onClick={() => handleOpenEditModal(student)}
                              className="p-1 hover:text-pink-800 transition"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="p-1 hover:text-red-600 transition"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-pink-700 text-sm"
                      >
                        Data siswa tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-pink-100 text-sm text-pink-700">
            <p>
              Menampilkan {filteredStudents.length} dari {students.length} siswa
            </p>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 border border-pink-200 rounded-full hover:bg-pink-50 text-pink-400 cursor-not-allowed">
                <ChevronLeft size={16} />
                Previous
              </button>
              <button className="w-8 h-8 rounded-full bg-pink-700 text-white font-medium flex items-center justify-center">
                1
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 border border-pink-200 rounded-full hover:bg-pink-50 text-pink-800">
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-bold text-pink-950">
                {editingStudent ? "Edit Data Siswa" : "Tambah Siswa Baru"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-pink-400 hover:text-pink-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-pink-800 uppercase mb-1">
                  NIS
                </label>
                <input
                  type="text"
                  name="nis"
                  required
                  value={formData.nis}
                  onChange={handleInputChange}
                  placeholder="Contoh: 2024006"
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pink-800 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nama Siswa"
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-pink-800 uppercase mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-pink-800 uppercase mb-1">
                    Kelas
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  >
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-pink-800 uppercase mb-1">
                    Jurusan
                  </label>
                  <input
                    type="text"
                    name="major"
                    required
                    value={formData.major}
                    onChange={handleInputChange}
                    placeholder="RPL / TKJ / dll"
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-pink-800 uppercase mb-1">
                    Tahun Masuk
                  </label>
                  <input
                    type="number"
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-pink-800 hover:bg-pink-50 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-700 hover:bg-pink-800 rounded-lg transition"
                >
                  {editingStudent ? "Simpan Perubahan" : "Tambah Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
