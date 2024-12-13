const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper'); 
class PsController {


    static async createPsStaff (req, res) 
    {
     const { Username, UserPassword, FullName,ContractNo, Email, LicenseNumber, EntryUserID, PsID } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber || !EntryUserID || !PsID) {
        return res.status(400).json({
            status: 1,
            message: "All fields are required."
        });
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
            return res.status(500).json({
                status: 1,
                message: "An error occurred while executing the procedure."
            });
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
        return res.status(500).json({
            status: 1,
            message: "Failed to create PS Staff.",
            error: error.message
        });
    }
};





static showpsstaff(req, res) {

    const PsID = req.query.PsID;
    if (!PsID) {
        return res.status(400).json({
          status: 1,
          message: 'district_id is required',
          data: []
        });
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






}



module.exports = PsController;
