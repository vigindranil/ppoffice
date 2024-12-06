const db = require('../config/db'); // Import your DB connection

class PasswordResetController {
    static resetPassword(req, res) {
        const { userId, newPassword } = req.body;

        // Validate input
        if (!userId || !newPassword) {
            return res.status(400).json({
                status: 1,
                message: "User ID and new password are required",
            });
        }

        // Call the stored procedure
        const query = "CALL sp_passwordreset(?, ?)";
        const params = [userId, newPassword];

        db.query(query, params, (err, results) => {
            if (err) {
                console.error("Error executing stored procedure:", err);
                return res.status(500).json({
                    status: 1,
                    message: "An error occurred while resetting the password",
                });
            }

            // Check if the password was updated successfully
            if (results.affectedRows > 0) {
                return res.status(200).json({
                    status: 0,
                    message: "Password reset successfully",
                });
            } else {
                return res.status(404).json({
                    status: 1,
                    message: "User ID not found",
                });
            }
        });
    }
}

module.exports = PasswordResetController;
