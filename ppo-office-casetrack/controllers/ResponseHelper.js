const logger = require('../utils/logger'); // Import the logger

class ResponseHelper {
    // Success response with logging
    static success(res, message, data = null, token = null) {
        const response = {
            status: 0,
            message: message || "Success",
            access_token: token || null,
            data: data || null,
        };

        // Log the success response
        logger.info(`Success: ${message}`, { data: data, token: token });

        // Send the response
        res.json(response);
    }

    // Error response with logging
    static error(res, message, data = null) {
        const response = {
            status: 1,
            message: message || "An error occurred",
            data: data || null,
        };

        // Log the error response
        logger.error(`Error: ${message}`, { data: data });

        // Send the response
        res.json(response);
    }

    // Success response without token with logging
    static success_reponse(res, message, data = null) {
        const response = {
            status: 0,
            message: message || "Success",
            data: data || null,
        };

        // Log the success response
        logger.info(`Success: ${message}`, { data: data });

        // Send the response
        res.json(response);
    }
}

module.exports = ResponseHelper;
