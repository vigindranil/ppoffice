// models/NotificationModel.js

const db = require('../config/db'); // Import the database connection

class NotificationModel {
  static getMailDetails(authorityTypeId, boundaryId) {
    return new Promise((resolve, reject) => {
      const query = 'CALL GetMailDetailsv1(?, ?)';
      const params = [authorityTypeId, boundaryId];

      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }

  static checkMailRead(mailId, caseId, authorityTypeId, boundaryId) {
    return new Promise((resolve, reject) => {
      const query = 'CALL sp_checkmail_Readv1(?, ?, ?, ?)';
      const params = [mailId, caseId, authorityTypeId, boundaryId];

      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }
}

module.exports = NotificationModel;