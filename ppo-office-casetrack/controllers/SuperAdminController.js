const db = require('../config/db');
const ResponseHelper = require('./ResponseHelper');
const logger = require('../utils/logger'); // Import logger

class SuperAdminController {

  static async createPPOfficeAdminUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber } = req.body;

    // Validate the required input fields
    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
      logger.error('Missing required fields for PPOfficeAdmin user creation');
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber are required");
    }

    try {
      const query = "CALL sp_saveCreateppofficeAdmin(?, ?, ?, ?, ?, ?, ?, @PPofficeAdminID, @ErrorCode)";
      const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID];

      await new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
          if (err) {
            logger.error('Error executing query for PPOfficeAdmin user creation: ' + err.message);
            return ResponseHelper.error(res, "An error occurred while fetching data");
          }
          resolve(results);
        });
      });

      const output = await new Promise((resolve, reject) => {
        db.query("SELECT @PPofficeAdminID AS PPofficeAdminID, @ErrorCode AS ErrorCode", (err, results) => {
          if (err) {
            logger.error('Error fetching output for PPOfficeAdmin user creation: ' + err.message);
            return ResponseHelper.error(res, "An error occurred while fetching data");
          }
          resolve(results[0]);
        });
      });

      const { PPofficeAdminID, ErrorCode } = output;

      if (ErrorCode === 0) {
        logger.info('PPOfficeAdmin user created successfully with ID: ' + PPofficeAdminID);
        return ResponseHelper.success_reponse(res, "PPOfficeAdmin user created successfully", { id: PPofficeAdminID });
      }
      if (ErrorCode === 4) {
        logger.warn('Login user is invalid');
        return ResponseHelper.success_reponse(res, "Login user is invalid");
      }
      if (ErrorCode === 5) {
        logger.warn('Login user has no permission to add user');
        return ResponseHelper.success_reponse(res, "Login user has no permission to add user");
      } else {
        logger.error('Failed to create PPOfficeAdmin. ErrorCode: ' + ErrorCode);
        return ResponseHelper.error(res, "Failed to create PPOfficeAdmin. Please check your input.");
      }
    } catch (error) {
      logger.error('Unexpected error occurred while creating PPOfficeAdmin: ' + error.message);
      return ResponseHelper.error(res, "An unexpected error occurred while creating the PPOfficeAdmin.", error);
    }
  }

  // Similar modifications can be made to the other methods (createPPHeadUser, createSPUser, etc.)

  static async showppofficeAdminUser(req, res) {
    try {
      const { EntryuserID } = req.body;

      if (!EntryuserID) {
        logger.warn('EntryuserID is required');
        return ResponseHelper.error(res, "EntryuserID is required");
      }

      const query = 'CALL sp_getPPOfficeAdminuser(?)';
      db.query(query, [EntryuserID], (err, results) => {
        if (err) {
          logger.error('Error fetching PPOfficeAdmin user data: ' + err.message);
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }
        if (results[0] && results[0].length > 0) {
          logger.info('Data found for PPOfficeAdmin user');
          return ResponseHelper.success_reponse(res, "Data found", results[0]);
        } else {
          logger.warn('No access to see PPOfficeAdmin user list');
          return ResponseHelper.error(res, "Logged in user has no access to see PPOfficeAdmin user list");
        }
      });
    } catch (error) {
      logger.error('Unexpected error occurred while fetching PPOfficeAdmin user: ' + error.message);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  // Similar logging can be added to other methods like showppofficeHeadnUser and showspUser
}

module.exports = SuperAdminController;
