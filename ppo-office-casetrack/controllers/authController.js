const jwt = require('jsonwebtoken');
const AuthModel = require('../models/AuthModel'); // Import the AuthModel
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
            // Query the model to validate the user
            const user = await AuthModel.getUserByCredentials(username, password);

            if (user) {
                // Generate a JWT token
                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

                // Respond with success
                return ResponseHelper.success(res, "Data found", user, token);
            } else {
                // Respond with invalid credentials
                return ResponseHelper.error(res, "Invalid credentials provided");
            }
        } catch (error) {
            // Catch and handle any unexpected errors
            console.error("Error during authentication:", error);
            return ResponseHelper.error(res, "An unexpected error occurred during authentication.");
        }
    }
}

module.exports = AuthController;