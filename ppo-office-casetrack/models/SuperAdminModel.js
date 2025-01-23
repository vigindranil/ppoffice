const db = require('../config/db'); // Assuming db is your database configuration

class SuperAdminModel {

  // Helper function to execute stored procedures
  static async executeStoredProcedure(query, params) {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  // Method to create PPOfficeAdmin user
  static async createPPOfficeAdminUser(params) {
    const query = "CALL sp_saveCreateppofficeAdmin(?, ?, ?, ?, ?, ?, ?, @PPofficeAdminID, @ErrorCode)";
    await this.executeStoredProcedure(query, params);
    
    const output = await this.executeStoredProcedure("SELECT @PPofficeAdminID AS PPofficeAdminID, @ErrorCode AS ErrorCode", []);
    return output[0];
  }

  // Method to create PPHead user
  static async createPPHeadUser(params) {
    const query = "CALL sp_saveCreateppofficeHead(?, ?, ?, ?, ?, ?, ?, @PPofficeHeadID, @ErrorCode)";
    await this.executeStoredProcedure(query, params);
    
    const output = await this.executeStoredProcedure("SELECT @PPofficeHeadID AS PPofficeHeadID, @ErrorCode AS ErrorCode", []);
    return output[0];
  }

  // Method to create SP user
  static async createSPUser(params) {
    const query = "CALL sp_saveCreatSpuser(?, ?, ?, ?, ?, ?, ?, ?, @SPID, @ErrorCode)";
    await this.executeStoredProcedure(query, params);
    
    const output = await this.executeStoredProcedure("SELECT @SPID AS SPID, @ErrorCode AS ErrorCode", []);
    return output[0];
  }

  // Method to retrieve PPOfficeAdmin users
  static async getPPOfficeAdminUsers(EntryuserID) {
    const query = 'CALL sp_getPPOfficeAdminuser(?)';
    const results = await this.executeStoredProcedure(query, [EntryuserID]);
    return results[0];
  }

  // Method to retrieve PPHead users
  static async getPPHeadUsers(EntryuserID) {
    const query = 'CALL sp_getHeadppofficeuser(?)';
    const results = await this.executeStoredProcedure(query, [EntryuserID]);
    return results[0];
  }

  // Method to retrieve SP users
  static async getSPUsers(EntryuserID, DistrictID) {
    const query = 'CALL sp_getSPuserV1(?,?)';
    const results = await this.executeStoredProcedure(query, [EntryuserID, DistrictID]);
    return results[0];
  }

  // Method to retrieve user counts
  static async getUserCounts(EntryuserID) {
    const query = 'CALL sp_UserCount(?)';
    const results = await this.executeStoredProcedure(query, [EntryuserID]);
    return results[0];
  }
}

module.exports = SuperAdminModel;