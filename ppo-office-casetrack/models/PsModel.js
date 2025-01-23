const db = require('../config/db');

class PsModel {
  // Create PS Staff
  static async createPsStaff(Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, PsID) {
    try {
      const [rows] = await db.promise().query(
        "CALL sp_saveCreatePsstaff(?, ?, ?, ?, ?, ?, ?, ?, @PsStaffId, @ErrorCode)",
        [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, PsID]
      );

      const [output] = await db.promise().query("SELECT @PsStaffId AS PsStaffId, @ErrorCode AS ErrorCode");
      const { PsStaffId, ErrorCode } = output[0];

      return { PsStaffId, ErrorCode };
    } catch (error) {
      throw new Error("Failed to create PS Staff");
    }
  }

  // Get PS Staff by PsID
  static async showPsStaffByPsID(PsID) {
    try {
      const [results] = await db.promise().query('CALL sp_getPsStaffByPsID(?)', [PsID]);
      return results[0];
    } catch (error) {
      throw new Error("An error occurred while fetching PS staff details");
    }
  }

  // Show all cases by PS ID
  static async showAllCasesByPsID(psId) {
    try {
      const [results] = await db.promise().query('CALL sp_ShowallCaseBypoliceID(?)', [psId]);
      return results[0];
    } catch (error) {
      throw new Error("An error occurred while fetching case details");
    }
  }

  // Get PS User details by ID
  static async showPsUserById(PSUserId) {
    try {
      const [results] = await db.promise().query('CALL sp_getPSUserDetailsbyId(?)', [PSUserId]);
      return results[0];
    } catch (error) {
      throw new Error("An error occurred while fetching PS user details");
    }
  }

  // Show all PS by district
  static async showAllPsByDistrict(districtId) {
    try {
      const [results] = await db.promise().query('CALL GetPoliceStationsByDistrict(?)', [districtId]);
      return results[0];
    } catch (error) {
      throw new Error("An error occurred while fetching police stations by district");
    }
  }
}

module.exports = PsModel;
