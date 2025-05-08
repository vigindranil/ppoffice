const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds timeout
});

// Log when connections are acquired and released
// db.on("acquire", (connection) => {
//     console.log(`Connection ${connection.threadId} acquired.`);
// });

// db.on("release", (connection) => {
//     console.log(`Connection ${connection.threadId} released.`);
// });

// Handle database errors globally
db.on("error", (err) => {
    console.error("Database connection error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
        console.log("Reconnecting to database...");
    }
});

// 🔹 Periodically ping the database to keep connections alive
setInterval(() => {
    db.query("SELECT 1", (err) => {
        if (err) {
            console.error("Database keep-alive error:", err);
        } else {
            console.log("Database connection is alive.");
        }
    });
}, 300000); // Every 5 minutes

module.exports = db;

// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     connectTimeout: 10000,
// });

// // 🔹 Generic async query wrapper (replaces all db.query calls)
// async function executeQuery(query, params = []) {
//     const connection = await pool.getConnection();
//     try {
//         const [results] = await connection.query(query, params);
//         return results;
//     } finally {
//         connection.release();
//     }
// }

// // 🔹 For queries that don't return results but still need connection management (like INSERT/UPDATE with callback)
// async function executeQueryNoResult(query, params = []) {
//     const connection = await pool.getConnection();
//     try {
//         await connection.query(query, params);
//     } finally {
//         connection.release();
//     }
// }

// // 🔹 For manually resolving with resolve/reject (like in Promises)
// async function executeRawQuery(query, params = []) {
//     const connection = await pool.getConnection();
//     try {
//         return await connection.query(query, params);
//     } finally {
//         connection.release();
//     }
// }

// module.exports = {
//     pool,
//     executeQuery,
//     executeQueryNoResult,
//     executeRawQuery,
// };