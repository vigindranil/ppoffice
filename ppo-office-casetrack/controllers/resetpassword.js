const db = require('../config/db'); // Import your DB connection
const ResponseHelper = require('./ResponseHelper');
const logger = require('../utils/logger'); // Import the logger

class PasswordResetController {
  static async resetPassword(req, res) {
    try {
      const { userId, newPassword } = req.body;

      // Validate input
      if (!userId || !newPassword) {
        logger.warn("Validation failed: userId or newPassword missing");
        return ResponseHelper.error(res, "userId and password are required");
      }

      // Log the reset attempt
      logger.info(`Attempting to reset password for userId: ${userId}`);

      // Call the stored procedure
      const query = "CALL sp_passwordreset(?, ?)";
      const params = [userId, newPassword];

      db.query(query, params, (err, results) => {
        if (err) {
          logger.error(`Error while resetting password for userId: ${userId}, Error: ${err.message}`);
          return ResponseHelper.error(res, "An error occurred while resetting the password.", err);
        }

        // Check if the password was updated successfully
        if (results.affectedRows > 0) {
          logger.info(`Password reset successfully for userId: ${userId}`);
          return ResponseHelper.success_reponse(res, "Password reset successfully", results[0]);
        } else {
          // Log the failure case
          logger.warn(`Password reset failed for userId: ${userId}. Invalid user ID.`);
          return ResponseHelper.error(res, "Please enter a valid user ID");
        }
      });
    } catch (error) {
      // Log any unexpected errors
      logger.error(`Unexpected error during password reset: ${error.message}`);
      return ResponseHelper.error(res, "An unexpected error occurred while resetting the password.", error);
    }
  }
}

module.exports = PasswordResetController;
