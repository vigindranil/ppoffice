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

        return ResponseHelper.success_reponse(res,"PPHead user created successfully",{ id: PPofficeAdminID });
       
      } else {
         return ResponseHelper.error(res,"Failed to create PPHead. Please check your input.",err);
        
      }
    } catch (error) {
     
      return ResponseHelper.error(res,"An unexpected error occurred while creating the PPHead.",error);

    }
  }

  
}

module.exports = SuperAdminController;
