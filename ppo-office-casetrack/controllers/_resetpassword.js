const db = require('../config/db'); // Import your DB connection
const ResponseHelper = require('./ResponseHelper'); 
class PasswordResetController {
    static async resetPassword(req, res) {
        try {
            const { userId, newPassword } = req.body;

            // Validate input
            if (!userId || !newPassword) {
                return ResponseHelper.error(res, "userId and password are required");
            }

            // Call the stored procedure
            const query = "CALL sp_passwordreset(?, ?)";
            const params = [userId, newPassword];

            db.query(query, params, (err, results) => {
                if (err) {
                   
                    return ResponseHelper.error(res, "An error occurred while resetting the password.",err);
                }

                // Check if the password was updated successfully
                if (results.affectedRows > 0) {
                    return ResponseHelper.success_reponse(res, "Password reset successfully", results[0]);
                } else {
                    // Respond with error
                    return ResponseHelper.error(res, "Please enter a valid user ID");
                }
            });
        } catch (error) {
           
            return ResponseHelper.error(res, "An unexpected error occurred while resetting the password.",err);
        }
    }
}


module.exports = PasswordResetController;
