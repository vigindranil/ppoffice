const db = require('../config/db'); // Import your DB connection
const ResponseHelper = require('./ResponseHelper'); 
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
                console.error('Error executing stored procedure:', err);
          return ResponseHelper.error(res, "An error occurred while fetching the staff details.");
            }
           
            // Check if the password was updated successfully
            if (results.affectedRows > 0) {
                return ResponseHelper.success_reponse(res, "password reset succesfully", results[0]);
            }
            else {
              // Respond with error
              return ResponseHelper.error(res, "please enter proper user Id");
          }
        });
    }
}

module.exports = PasswordResetController;
