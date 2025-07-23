import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',          // Replace with your MySQL username
    password: 'root', // Replace with your MySQL password
    database: 'mess_feedback_system'
};

let pool;

async function connectDB() {
    try {
      if (!pool) {
        pool = await mysql.createPool(dbConfig);
        console.log('Connected to MySQL database');
      }
      return pool;
    } catch (err) {
      console.error('Database connection failed:', err);
      throw err;
    }
}

export default connectDB;