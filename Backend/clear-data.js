import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mess_feedback_system'
};

async function clearData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // First delete feedback (has foreign key to students)
        await connection.execute('DELETE FROM feedback');
        console.log('✓ Cleared all feedback records');

        // Then delete students
        await connection.execute('DELETE FROM students');
        console.log('✓ Cleared all student records');

        // Optionally delete admins too
        await connection.execute('DELETE FROM admins');
        console.log('✓ Cleared all admin records');

        console.log('\n✅ All data cleared successfully!');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

clearData();
