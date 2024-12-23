const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper');

class SuperAdminController {
  static async createPPOfficeAdminUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber } = req.body;

    // Validate the required input fields
    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber are required");
    }

    try {
      // Call the stored procedure
      const query = "CALL sp_saveCreateppofficeAdmin(?, ?, ?, ?, ?, ?, ?, @PPofficeAdminID, @ErrorCode)";
      const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID];

      // Execute the stored procedure
      await new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
          if (err) {
            return ResponseHelper.error(res, "An error occurred while fetching data");
          }
          resolve(results);
        });
      });

      // Fetch the output parameters from the procedure
      const output = await new Promise((resolve, reject) => {
        db.query("SELECT @PPofficeAdminID AS PPofficeAdminID, @ErrorCode AS ErrorCode", (err, results) => {
          if (err) {
            return ResponseHelper.error(res, "An error occurred while fetching data");
          }
          resolve(results[0]);
        });
      });

      const { PPofficeAdminID, ErrorCode } = output;

      // Check the output error code from the stored procedure
      if (ErrorCode === 0) {
        return res.status(200).json({
          status: 0,
          message: "PPUser created successfully.",
          data: { id: PPofficeAdminID },
        });
      } else {
        return res.status(400).json({
          status: 1,
          message: "Failed to create PP Staff. Please check your input.",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({
        status: 1,
        message: "An unexpected error occurred while creating the PP staff.",
      });
    }
  }

  
}

module.exports = SuperAdminController;
