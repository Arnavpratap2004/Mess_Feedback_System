import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mess_feedback_system',
    // Most hosted MySQL providers require TLS.
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    // Each serverless instance keeps its own pool, so keep it small to avoid
    // exhausting the provider's connection limit.
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 3,
    waitForConnections: true
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
