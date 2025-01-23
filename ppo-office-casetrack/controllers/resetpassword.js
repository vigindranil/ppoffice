const PasswordResetModel = require('../models/PasswordResetModel'); // Import the model
const ResponseHelper = require('./ResponseHelper'); // Assuming you already have a response helper

class PasswordResetController {
    static async resetPassword(req, res) {
        try {
            const { userId, newPassword } = req.body;

            // Validate input
            if (!userId || !newPassword) {
                return ResponseHelper.error(res, "userId and password are required");
            }

            // Call the model to handle the password reset logic
            const results = await PasswordResetModel.resetPassword(userId, newPassword);

            // Check if the password was updated successfully
            if (results.affectedRows > 0) {
                return ResponseHelper.success_reponse(res, "Password reset successfully", results[0]);
            } else {
                // Respond with error
                return ResponseHelper.error(res, "Please enter a valid user ID");
            }
        } catch (error) {
            return ResponseHelper.error(res, "An unexpected error occurred while resetting the password.", error);
        }
    }
}

module.exports = PasswordResetController;