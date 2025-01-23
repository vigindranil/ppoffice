// models/PPUserModel.js
const db = require('../config/db');

class PPUserModel {

  static async createPPUser(params) {
    const query = "CALL sp_saveCreatePPuser(?, ?, ?, ?, ?, ?, ?, @PPUserID, @ErrorCode)";
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) return reject("An error occurred while creating PPUser");
        resolve(results);
      });
    });
  }

  static async fetchOutputParams() {
    const query = "SELECT @PPUserID AS PPUserID, @ErrorCode AS ErrorCode";
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject("An error occurred while fetching output parameters");
        resolve(results[0]);
      });
    });
  }

  static async getPPUser(EntryuserID) {
    const query = 'CALL sp_getPPuser(?)';
    return new Promise((resolve, reject) => {
      db.query(query, [EntryuserID], (err, results) => {
        if (err) return reject("An error occurred while fetching PPUser data");
        resolve(results[0]);
      });
    });
  }

  static async getCaseDetailsByPPUserId(ppuserID) {
    const query = 'CALL sp_getCaseDetailsByPPUserId(?)';
    return new Promise((resolve, reject) => {
      db.query(query, [ppuserID], (err, results) => {
        if (err) return reject("An error occurred while fetching case details");
        resolve(results[0]);
      });
    });
  }

  static async assignCaseToPPUser(params) {
    const query = "CALL sp_saveCaseAssign(?, ?, ?, @CaseAssignID, @ErrorCode)";
    return new Promise((resolve, reject) => {
      db.query(query, params, (err) => {
        if (err) return reject("An error occurred while assigning case");
        db.query("SELECT @CaseAssignID AS CaseAssignID, @ErrorCode AS ErrorCode", (outputErr, outputResults) => {
          if (outputErr) return reject("Error fetching output parameters");
          resolve(outputResults[0]);
        });
      });
    });
  }

  static async getPPUserDetailsById(PPUserId) {
    const query = 'CALL sp_getPPUserDetailsbyId(?)';
    return new Promise((resolve, reject) => {
      db.query(query, [PPUserId], (err, results) => {
        if (err) return reject("An error occurred while fetching PPUser details");
        resolve(results[0]);
      });
    });
  }
}

module.exports = PPUserModel;