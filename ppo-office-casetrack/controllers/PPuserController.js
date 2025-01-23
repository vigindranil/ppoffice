// controllers/PPUserController.js
const PPUserModel = require('../models/PPUserModel');
const ResponseHelper = require('./ResponseHelper');

class PPUserController {

  // Method to create PPUser
  static async createPPUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber are required");
    }

    try {
      const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID];
      const results = await PPUserModel.createPPUser(params);
      const output = await PPUserModel.fetchOutputParams();
      const { PPUserID, ErrorCode } = output;

      if (ErrorCode === 0) {
        return res.status(200).json({
          status: 0,
          message: "PPUser created successfully.",
          data: { id: PPUserID },
        });
      } else {
        return res.status(400).json({
          status: 1,
          message: "Failed to create PP Staff. Please check your input.",
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 1,
        message: error || "An unexpected error occurred while creating the PP staff.",
      });
    }
  }

  // PP head can see PPUser
  static async showppuser(req, res) {
    try {
      const EntryuserID = req.query.EntryuserID;
      if (!EntryuserID) return ResponseHelper.error(res, "EntryuserID is required");

      const ppUserData = await PPUserModel.getPPUser(EntryuserID);

      if (ppUserData && ppUserData.length > 0) {
        return ResponseHelper.success_reponse(res, "Data found", ppUserData);
      } else {
        return ResponseHelper.error(res, "Logged in user no access to see PPUser list");
      }
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  // PP user can see their assigned cases
  static async caseDetailsByPPuserId(req, res) {
    const ppuserID = req.query.ppuserID;
    if (!ppuserID) return ResponseHelper.error(res, "ppuserID is required");

    try {
      const caseDetails = await PPUserModel.getCaseDetailsByPPUserId(ppuserID);

      if (caseDetails && caseDetails.length > 0) {
        return ResponseHelper.success_reponse(res, "Data found", caseDetails);
      } else {
        return ResponseHelper.error(res, "No data found");
      }
    } catch (error) {
      return ResponseHelper.error(res, "An error occurred while fetching case details");
    }
  }

  // Assign a case to a PPUser by PP head
  static async assignCasetoppuser(req, res) {
    const { PPUserID, EntryUserID, CaseID } = req.body;

    if (!PPUserID || !EntryUserID || !CaseID) {
      return ResponseHelper.error(res, "All fields are required: PPUserID, EntryUserID, CaseID.");
    }

    try {
      const params = [PPUserID, EntryUserID, CaseID];
      const output = await PPUserModel.assignCaseToPPUser(params);
      const { CaseAssignID, ErrorCode } = output;

      switch (ErrorCode) {
        case 0:
          return res.json({
            status: 0,
            message: "Case assigned successfully.",
            data: { CaseAssignID },
          });
        case 1:
          return ResponseHelper.error(res, "An error occurred during case assignment. Please try again.");
        case 2:
          return ResponseHelper.error(res, "Case Already Assigned");
        case 3:
          return ResponseHelper.error(res, "CaseID invalid");
        case 4:
          return ResponseHelper.error(res, "Logged in user is invalid");
        case 5:
          return ResponseHelper.error(res, "Logged in user has no permission to assign case");
        default:
          return ResponseHelper.error(res, "An unknown error occurred");
      }
    } catch (error) {
      return ResponseHelper.error(res, "An error occurred while assigning case");
    }
  }

  // PPUser can see PP details
  static async getppuserDetailsById(req, res) {
    try {
      const PPUserId = req.query.PPUserId;
      if (!PPUserId) return ResponseHelper.error(res, "PPUserId is required");

      const ppUserDetails = await PPUserModel.getPPUserDetailsById(PPUserId);
      return ResponseHelper.success_reponse(res, "Data found", ppUserDetails);
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }
}

module.exports = PPUserController;
