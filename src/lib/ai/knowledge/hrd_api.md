# Proyek Backend: HRD RESTful API (Arsitektur MVC & Konsep OOP)

- **Repository GitHub:** https://github.com/LIan2nd/uas-pemrograman-backend
- **Konteks:** Final Project UAS Mata Kuliah Pemrograman Backend di STT Terpadu Nurul Fikri
- **Tech Stack:** Node.js, Express.js, MySQL (mysql2), Passport.js, Body-Parser, Dotenv
- **Pola Desain:** MVC (Model-View-Controller) & OOP (Object-Oriented Programming)

---

## 🏛️ Penerapan Konsep OOP (Object-Oriented Programming) & MVC

Proyek ini mengimplementasikan prinsip-prinsip **OOP** secara terstruktur pada lingkungan Node.js / Express:

### 1. Enkapsulasi Berbasis Class (Class-Based Encapsulation)
- **`class EmployeeController` (`controllers/EmployeeController.js`):**
  Mengenkapsulasi seluruh *request handler methods* (`index()`, `store()`, `find()`, `update()`, `destroy()`, `search()`, `active()`, `inactive()`, `terminated()`) ke dalam satu unit objek pengendali alur bisnis.
- **`class Employee` (`models/Employee.js`):**
  Mengenkapsulasi seluruh operasi akses data dan SQL query langsung ke tabel MySQL.

### 2. Static Methods & DAO / Active Record Pattern
- Model `Employee` menggunakan *static methods* (`Employee.all()`, `Employee.create()`, `Employee.show()`, `Employee.update()`, `Employee.delete()`, `Employee.search()`) untuk mengabstraksi kompleksitas query database dari controller, mencerminkan pola **Data Access Object (DAO)**.

### 3. Pemisahan Tanggung Jawab (Single Responsibility Principle - SOLID)
- **Routing Layer (`routes/api.js`):** Murni memetakan endpoint HTTP dan melempar ke instance controller.
- **Controller Layer (`EmployeeController`):** Murni mengurus validasi input payload, penanganan status response HTTP, dan pemanggilan model.
- **Model Layer (`Employee`):** Murni mengurus persistensi data SQL dan transaksi database.

### 4. Integrasi OOP & Asynchronous JavaScript (Promises & Async/Await)
- Setiap method pada Model mengembalikan `Promise`, yang di-konsumsi secara bersih oleh Controller menggunakan sintaks `async/await` untuk eksekusi I/O non-blocking yang efisien.

---

## ✨ Fitur & Endpoint RESTful

| Method | Endpoint | Fungsi Core |
|---|---|---|
| `GET` | `/api/employees` | Mengambil seluruh data koleksi pegawai |
| `POST` | `/api/employees` | Validasi & insert data entitas pegawai baru (Status: 201 Created / 422 Unprocessable) |
| `GET` | `/api/employees/:id` | Query data spesifik berdasarkan ID entitas |
| `PUT` | `/api/employees/:id` | Update data pegawai dengan validasi dinamis |
| `DELETE` | `/api/employees/:id` | Menghapus data pegawai dari database |
| `GET` | `/api/employees/search/:name` | Pencarian parsial/spesifik nama pegawai |
| `GET` | `/api/employees/status/active` | Query filter pegawai berstatus `active` |
| `GET` | `/api/employees/status/inactive` | Query filter pegawai berstatus `inactive` |
| `GET` | `/api/employees/status/terminated` | Query filter pegawai berstatus `terminated` |

---

## 💡 Instruksi Menjawab untuk AI Clone:
- Ketika ditanya mengenai proyek HRD RESTful API, jelaskan bahwa proyek ini mengombinasikan **arsitektur MVC** dan **konsep OOP (Class-based Controllers & DAO Models)**, *Separation of Concerns*, serta *asynchronous Promise-based database queries* menggunakan Express.js dan MySQL.
