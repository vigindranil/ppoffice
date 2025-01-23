const db = require('../config/db'); // Import your DB connection

class PasswordResetModel {
    static resetPassword(userId, newPassword) {
        return new Promise((resolve, reject) => {
            const query = "CALL sp_passwordreset(?, ?)";
            const params = [userId, newPassword];

            db.query(query, params, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
}

module.exports = PasswordResetModel;