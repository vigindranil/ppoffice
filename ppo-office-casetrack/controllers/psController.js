const PsModel = require('../models/PsModel'); // Import the PsModel
const ResponseHelper = require('./ResponseHelper'); 

class PsController {
  
  // Create PS staff by stored procedure
  static async createPsStaff(req, res) {
    const { Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, PsID } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber || !EntryUserID || !PsID) {
      return ResponseHelper.error(res, "Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, PsID are required");
    }

    try {
      const { PsStaffId, ErrorCode } = await PsModel.createPsStaff(Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, PsID);

      if (ErrorCode === 1) {
        return ResponseHelper.error(res, "An error occurred while executing the procedure");
      }

      return res.status(200).json({
        status: 0,
        message: "PS Staff created successfully.",
        data: { PsStaffId }
      });

    } catch (error) {
      return ResponseHelper.error(res, error.message || "Failed to create PS Staff");
    }
  }

  // Show PS staff by PsID
  static async showPsStaff(req, res) {
    const PsID = req.query.PsID;

    if (!PsID) {
      return ResponseHelper.error(res, "PsID is required");
    }

    try {
      const results = await PsModel.showPsStaffByPsID(PsID);

      if (results && results.length > 0) {
        return ResponseHelper.success_reponse(res, "Data found", results);
      } else {
        return ResponseHelper.error(res, "No data found");
      }

    } catch (error) {
      return ResponseHelper.error(res, error.message || "An error occurred while fetching PS staff details");
    }
  }

  // Show all cases by PS ID
  static async showAllCasesByPsID(req, res) {
    const psId = req.query.psId;

    if (!psId) {
      return ResponseHelper.error(res, "psId is required");
    }

    try {
      const results = await PsModel.showAllCasesByPsID(psId);
      return ResponseHelper.success_reponse(res, "Data found", results);
    } catch (error) {
      return ResponseHelper.error(res, error.message || "An error occurred while fetching cases");
    }
  }

  // Show PS user by ID
  static async showPsUserById(req, res) {
    const { PSUserId } = req.body;

    if (!PSUserId) {
      return ResponseHelper.error(res, "PSUserId is required");
    }

    try {
      const results = await PsModel.showPsUserById(PSUserId);

      if (results && results.length > 0) {
        return ResponseHelper.success_reponse(res, "Data found", results);
      } else {
        return ResponseHelper.error(res, "No data found");
      }

    } catch (error) {
      return ResponseHelper.error(res, error.message || "An error occurred while fetching PS user details");
    }
  }

  // Show all PS by district
  static async showAllPsByDistrict(req, res) {
    const districtId = req.query.districtId;

    if (!districtId) {
      return ResponseHelper.error(res, "districtId is required");
    }

    try {
      const results = await PsModel.showAllPsByDistrict(districtId);
      return ResponseHelper.success_reponse(res, "Data found", results);
    } catch (error) {
      return ResponseHelper.error(res, error.message || "An error occurred while fetching police stations by district");
    }
  }
}

module.exports = PsController;