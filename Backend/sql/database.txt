CREATE DATABASE mess_feedback_system;
USE mess_feedback_system;
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    reg_no VARCHAR(20) NOT NULL UNIQUE,
    student_password VARCHAR(255) NOT NULL
);
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    admin_password VARCHAR(255) NOT NULL
);
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_reg_no VARCHAR(20) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    block_name VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    mess_name VARCHAR(100) NOT NULL,
    mess_type ENUM('Veg', 'Non-Veg', 'Special', 'Night') NOT NULL,
    category ENUM('Quality', 'Quantity', 'Hygiene', 'Mess Timing', 'Others') NOT NULL,
    feedback TEXT NOT NULL,
    comments TEXT,
    proof_path VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_reg_no) REFERENCES students(reg_no)
);