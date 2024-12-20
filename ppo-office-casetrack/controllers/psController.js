const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper'); 
class PsController {

    // create ps staff by Sp
    static async createPsStaff (req, res) 
    {
     const { Username, UserPassword, FullName,ContractNo, Email, LicenseNumber, EntryUserID, PsID } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber || !EntryUserID || !PsID) {
        console.error('Error executing stored procedure:', err);
        return ResponseHelper.error(res, "Username, UserPassword, FullName,ContractNo, Email, LicenseNumber, EntryUserID, PsID");
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
          
            return  ResponseHelper.error(res,"An error occurred while executing the procedure");
        }
        

        return res.status(200).json({
            status: 0,
            message: "Ps Staff created successfully.",
            data: {
                PsStaffId: PsStaffId,
            },
        });
    } catch (error) {
        console.error("Error creating PS Staff:", error);
        return  ResponseHelper.error(res,"Failed to create PS Staff");
    }
}





static showpsstaff(req, res) {

    const PsID = req.query.PsID;
    if (!PsID) {
      return ResponseHelper.error(res, "PsID required");
    }
    const query = 'CALL sp_getPsStaffByPsID(?)';  

    db.query(query,[PsID],(err, results) => {
      if (err) {
          console.error('Error executing stored procedure:', err);
          return ResponseHelper.error(res, "An error occurred while fetching the police details.");
      }
    
      // Assuming your stored procedure returns data in results[0]
      if (results[0] && results[0].length > 0) {

        // Respond with success
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
    }
    else {
      // Respond with error
      return ResponseHelper.error(res, "No data found");
  }

    });
  }
  
  // Show all Case By policeID
  static async showallcasesBypoliceID(req, res) {
    try {
      // Retrieve the psId from the query parameters or request body
      const psId = req.query.psId; 

      
      if (!psId) {
        return ResponseHelper.error(res, "psId is required");
      }

      // SQL query to call the stored procedure with the district_id parameter
      const query = 'CALL sp_ShowallCaseBypoliceID(?)';
      // Pass the districtId as an argument to the stored procedure
      db.query(query, [psId], (err, results) => {
        if (err) {
          console.error('Error executing stored procedure:', err);
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        // Assuming your stored procedure returns data in results[0]
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

}



module.exports = PsController;
