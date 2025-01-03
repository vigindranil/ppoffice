const jwt = require('jsonwebtoken');
const db = require('../config/db');
const ResponseHelper = require('./ResponseHelper');
const logger = require('../utils/logger'); // Import the logger
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
class AuthController {
    static async authenticateUser(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            logger.warn("Authentication attempt with missing username or password");
            return ResponseHelper.error(res, "Username and password are required");
        }

        try {
            const query = `CALL sp_getAuthorityLogin(?, ?)`;
            const params = [username, password];

            db.query(query, params, (err, results) => {
                if (err) {
                    logger.error("Database error during user authentication", { error: err });
                    return ResponseHelper.error(res, "An error occurred while validating the user.");
                }

                if (results[0] && results[0].length > 0) {
                    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
                    logger.info(`User authenticated successfully: ${username}`);
                    return ResponseHelper.success(res, "Data found", results[0], token);
                } else {
                    logger.warn(`Invalid credentials provided for username: ${username}`);
                    return ResponseHelper.error(res, "Invalid credentials provided");
                }
            });
        } catch (error) {
            logger.error("Unexpected error during authentication", { error });
            return ResponseHelper.error(res, "An unexpected error occurred during authentication.");
        }
    }
}

module.exports = AuthController;
