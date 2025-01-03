const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper');
const logger = require('../utils/logger'); // Import the logger

class PsController {
  // Create PS staff
  static async createPsStaff(req, res) {
    const { Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, PsID } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber || !EntryUserID || !PsID) {
      logger.warn("Validation failed: Missing required fields");
      return ResponseHelper.error(res, "Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, PsID are required");
    }

    try {
      // Call the stored procedure
      const [rows] = await db.promise().query(
        "CALL sp_saveCreatePsstaff(?, ?, ?, ?, ?, ?, ?, ?, @PsStaffId, @ErrorCode)",
        [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID, PsID]
      );

      // Fetch the output parameters
      const [output] = await db.promise().query("SELECT @PsStaffId AS PsStaffId, @ErrorCode AS ErrorCode");
      const { PsStaffId, ErrorCode } = output[0];

      if (ErrorCode === 1) {
        logger.error("Error occurred while executing the procedure for creating PS staff");
        return ResponseHelper.error(res, "An error occurred while executing the procedure");
      }

      logger.info(`PS Staff created successfully with ID: ${PsStaffId}`);
      return res.status(200).json({
        status: 0,
        message: "Ps Staff created successfully.",
        data: {
          PsStaffId: PsStaffId,
        },
      });
    } catch (error) {
      logger.error(`Failed to create PS Staff: ${error.message}`);
      return ResponseHelper.error(res, "Failed to create PS Staff");
    }
  }

  // Show PS staff by PS ID
  static showpsstaff(req, res) {
    const PsID = req.query.PsID;
    if (!PsID) {
      logger.warn("PsID is required");
      return ResponseHelper.error(res, "PsID required");
    }
    const query = 'CALL sp_getPsStaffByPsID(?)';

    db.query(query, [PsID], (err, results) => {
      if (err) {
        logger.error('Error executing stored procedure for fetching PS staff details:', err);
        return ResponseHelper.error(res, "An error occurred while fetching the police details.");
      }

      // Assuming your stored procedure returns data in results[0]
      if (results[0] && results[0].length > 0) {
        logger.info(`PS staff found for PsID: ${PsID}`);
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      } else {
        logger.warn(`No data found for PsID: ${PsID}`);
        return ResponseHelper.error(res, "No data found");
      }
    });
  }

  // Show all cases by police ID
  static async showallcasesBypoliceID(req, res) {
    try {
      const psId = req.query.psId;

      if (!psId) {
        logger.warn("psId is required");
        return ResponseHelper.error(res, "psId is required");
      }

      const query = 'CALL sp_ShowallCaseBypoliceID(?)';
      db.query(query, [psId], (err, results) => {
        if (err) {
          logger.error('Error executing stored procedure for fetching cases:', err);
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        logger.info(`Fetched cases for police ID: ${psId}`);
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      });
    } catch (error) {
      logger.error(`Unexpected error: ${error.message}`);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  static async showpsuserById(req, res) {
    try {
      const { PSUserId } = req.body;

      if (!PSUserId) {
        logger.warn("PSUserId is required");
        return ResponseHelper.error(res, "PSUserId is required");
      }

      const query = 'CALL sp_getPSUserDetailsbyId(?)';
      db.query(query, [PSUserId], (err, results) => {
        if (err) {
          logger.error('Error fetching PS user details:', err);
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        if (results[0] && results[0].length > 0) {
          logger.info(`PS user details found for PSUserId: ${PSUserId}`);
          return ResponseHelper.success_reponse(res, "Data found", results[0]);
        }
      });
    } catch (error) {
      logger.error(`Unexpected error while fetching PS user details: ${error.message}`);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  static async showallpsBydistrict(req, res) {
    try {
      const districtId = req.query.districtId;

      if (!districtId) {
        logger.warn("districtId is required");
        return ResponseHelper.error(res, "districtId is required");
      }

      const query = 'CALL GetPoliceStationsByDistrict(?)';
      db.query(query, [districtId], (err, results) => {
        if (err) {
          logger.error('Error executing stored procedure for fetching police stations:', err);
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        logger.info(`Fetched police stations for district ID: ${districtId}`);
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      });
    } catch (error) {
      logger.error(`Unexpected error while fetching police stations: ${error.message}`);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }
}

module.exports = PsController;
