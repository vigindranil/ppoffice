const db = require('../config/db');

class PPOfficeAdminModel {

  static async createPPOfficeAdminUser(params) {
    const query = "CALL sp_saveCreateppofficeAdmin(?, ?, ?, ?, ?, ?, ?, @PPofficeAdminID, @ErrorCode)";
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async getPPOfficeAdminUser(EntryuserID) {
    const query = 'CALL sp_getPPOfficeAdminuser(?)';
    return new Promise((resolve, reject) => {
      db.query(query, [EntryuserID], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }

  static async createPPHeadUser(params) {
    const query = "CALL sp_saveCreateppofficeHead(?, ?, ?, ?, ?, ?, ?, @PPofficeHeadID, @ErrorCode)";
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async createSPUser(params) {
    const query = "CALL sp_saveCreatSpuser(?, ?, ?, ?, ?, ?, ?, ?, @SPID, @ErrorCode)";
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static async getUserCounts(EntryuserID) {
    const query = 'CALL sp_UserCount(?)';
    return new Promise((resolve, reject) => {
      db.query(query, [EntryuserID], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results[0]);
      });
    });
  }

}

module.exports = PPOfficeAdminModel;
