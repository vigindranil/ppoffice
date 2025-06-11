// const mysql = require("mysql2");
// require("dotenv").config();

// const db = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     connectTimeout: 10000, // 10 seconds timeout
// });

// // Log when connections are acquired and released
// // db.on("acquire", (connection) => {
// //     console.log(`Connection ${connection.threadId} acquired.`);
// // });

// // db.on("release", (connection) => {
// //     console.log(`Connection ${connection.threadId} released.`);
// // });

// // Handle database errors globally
// db.on("error", (err) => {
//     console.error("Database connection error:", err);
//     if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
//         console.log("Reconnecting to database...");
//     }
// });

// // 🔹 Periodically ping the database to keep connections alive
// setInterval(() => {
//     db.query("SELECT 1", (err) => {
//         if (err) {
//             console.error("Database keep-alive error:", err);
//         } else {
//             console.log("Database connection is alive.");
//         }
//     });
// }, 300000); // Every 5 minutes

// module.exports = db;


///////////////////////////////////////////////////////////////////////////

const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
}).promise();

// db = shorthand for pool.query
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
});

// Optional logging
// pool.on("acquire", (connection) => {
//     console.log(`Connection ${connection.threadId} acquired.`);
// });

// pool.on("release", (connection) => {
//     console.log(`Connection ${connection.threadId} released.`);
// });

/////////////////////////////////////////////////////

// pool.on("error", (err) => {
//     console.error("Database connection error:", err);
//     if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
//         console.log("Reconnecting to database...");
//     }
// });

// // Keep-alive
// setInterval(() => {
//     pool.query("SELECT 1", (err) => {
//         if (err) {
//             console.error("Database keep-alive error:", err);
//         } else {
//             console.log("Database connection is alive.");
//         }
//     });
// }, 300000); // Every 5 minutes

/////////////////////////////////////////////////////

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

// Export both named exports
module.exports = {
    db,
    pool,
};

//////////////////////////////////////////////////////////////////////

// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   connectTimeout: 10000,
// });

// // Keep-alive
// setInterval(async () => {
//   try {
//     const conn = await pool.getConnection();
//     await conn.query("SELECT 1");
//     conn.release();
//     console.log("Database connection is alive.");
//   } catch (err) {
//     console.error("Keep-alive error:", err);
//   }
// }, 300000); // Every 5 minutes

// // Export
// module.exports = {
//   db: pool,  // if you're using db.query
//   pool,      // if you want getConnection
// };
