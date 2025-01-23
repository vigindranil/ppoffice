const db = require('../config/db'); // Import your database connection

class AuthModel {
    // Method to get user by username and password
    static getUserByCredentials(username, password) {
        return new Promise((resolve, reject) => {
            const query = `CALL sp_getAuthorityLogin(?, ?)`;
            const params = [username, password];

            db.query(query, params, (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return reject(err); // Reject the promise on error
                }

                // Check if results are returned
                if (results[0] && results[0].length > 0) {
                    resolve(results[0]); // Resolve with the user data
                } else {
                    resolve(null); // No user found
                }
            });
        });
    }
}

module.exports = AuthModel;