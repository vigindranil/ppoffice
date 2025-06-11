const jwt = require('jsonwebtoken');
// const db = require('../config/db'); // Import your database connection
const { db } = require('../config/db'); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper

// Secret key for signing the JWT (store this securely, e.g., in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class AuthController {
    // Method for user authentication
    static async authenticateUser(req, res) {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return ResponseHelper.error(res, "Username and password are required");
        }

        try {
            // Query the database using a stored procedure
            const query = `CALL sp_getAuthorityLogin(?, ?)`;
            const params = [username, password];

            db.query(query, params, (err, results) => {
                if (err) {
                    // Handle database errors
                    console.error("Database error:", err);
                    return ResponseHelper.error(res, "An error occurred while validating the user.");
                }

                // Check if the stored procedure returned any results
                if (results[0] && results[0].length > 0) {
                    // Generate a JWT token
                    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

                    // Respond with success
                    return ResponseHelper.success(res, "Data found", results[0], token);
                } else {
                    // Respond with invalid credentials
                    return ResponseHelper.success(res, "Invalid credentials provided");
                }
            });
        } catch (error) {
            // Catch and handle any unexpected errors
            
            return ResponseHelper.error(res, "An unexpected error occurred during authentication.");
        }
    }
}

module.exports = AuthController;
