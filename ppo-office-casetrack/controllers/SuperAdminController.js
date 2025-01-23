const PPOfficeAdminModel = require('../models/PPOfficeAdminModel');
const ResponseHelper = require('./ResponseHelper');

class SuperAdminController {

  static async createPPOfficeAdminUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber are required", null, 400);
    }

    try {
      const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID];
      const results = await PPOfficeAdminModel.createPPOfficeAdminUser(params);

      const output = await PPOfficeAdminModel.getPPOfficeAdminUser();

      const { PPofficeAdminID, ErrorCode } = output;

      if (ErrorCode === 0) {
        return ResponseHelper.success_reponse(res, "PPOfficeAdmin user created successfully", { id: PPofficeAdminID });
      } else if (ErrorCode === 4) {
        return ResponseHelper.error(res, "Login user is invalid", null, 400);
      } else if (ErrorCode === 5) {
        return ResponseHelper.error(res, "Login user has no permission to add user", null, 403);
      } else {
        return ResponseHelper.error(res, "Failed to create PPOfficeAdmin. Please check your input.", null, 400);
      }
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred while creating the PPOfficeAdmin.", error, 500);
    }
  }

  static async createPPHeadUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber are required");
    }

    try {
      const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID];
      const results = await PPOfficeAdminModel.createPPHeadUser(params);

      const output = await PPOfficeAdminModel.getPPOfficeAdminUser();

      const { PPofficeHeadID, ErrorCode } = output;

      if (ErrorCode === 0) {
        return ResponseHelper.success_reponse(res, "PPHead user created successfully", { id: PPofficeHeadID });
      } else if (ErrorCode === 4) {
        return ResponseHelper.error(res, "Login user is invalid", null, 400);
      } else if (ErrorCode === 5) {
        return ResponseHelper.error(res, "Login user has no permission to add user", null, 403);
      } else {
        return ResponseHelper.error(res, "Failed to create PPHead. Please check your input.", null, 400);
      }
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred while creating the PPHead.", error, 500);
    }
  }

  static async createSPUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber, DistrictID } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber || !DistrictID) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber, DistrictID are required");
    }

    try {
      const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, DistrictID];
      const results = await PPOfficeAdminModel.createSPUser(params);

      const output = await PPOfficeAdminModel.getPPOfficeAdminUser();

      const { SPID, ErrorCode } = output;

      if (ErrorCode === 0) {
        return ResponseHelper.success_reponse(res, "SP user created successfully", { id: SPID });
      } else if (ErrorCode === 4) {
        return ResponseHelper.error(res, "Login user is invalid", null, 400);
      } else if (ErrorCode === 5) {
        return ResponseHelper.error(res, "Login user has no permission to add user", null, 403);
      } else {
        return ResponseHelper.error(res, "Failed to create SP user. Please check your input.", null, 400);
      }
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred while creating the SP user.", error, 500);
    }
  }

  static async showPPOfficeAdminUser(req, res) {
    const { EntryuserID } = req.body;

    if (!EntryuserID) {
      return ResponseHelper.error(res, "EntryuserID is required");
    }

    try {
      const results = await PPOfficeAdminModel.getPPOfficeAdminUser(EntryuserID);

      if (results && results.length > 0) {
        return ResponseHelper.success_reponse(res, "Data found", results);
      } else {
        return ResponseHelper.error(res, "Logged in user has no access to see PP Admin user list", null, 403);
      }
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred", error, 500);
    }
  }

  static async getUserCounts(req, res) {
    const { EntryuserID } = req.body;

    if (!EntryuserID) {
      return ResponseHelper.error(res, "EntryuserID is required");
    }

    try {
      const results = await PPOfficeAdminModel.getUserCounts(EntryuserID);

      let PPofficeAdmin = 0, PPHead = 0, SPuser = 0, PSuser = 0, PPuser = 0;

      results.forEach(row => {
        if (row.userType === 10) PPofficeAdmin = row.usercount;
        if (row.userType === 20) PPHead = row.usercount;
        if (row.userType === 30) SPuser = row.usercount;
        if (row.userType === 50) PSuser = row.usercount;
        if (row.userType === 60) PPuser = row.usercount;
      });

      const response = { PPofficeAdmin, PPHead, SPuser, PSuser, PPuser };
      return ResponseHelper.success_reponse(res, "Counts retrieved successfully", response);
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred", error, 500);
    }
  }

}

module.exports = SuperAdminController;