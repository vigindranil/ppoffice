const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper'); 
class UserController {
  static async createPPUser(req, res) {
    const { Username, UserPassword, EntryUserID,FullName, ContractNo, Email, LicenseNumber } = req.body;

    // Validate the required input fields
    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
        
        return ResponseHelper.error(res, "Username, UserPassword, EntryUserID,FullName, ContractNo, Email, LicenseNumber are required");
    }

    try {
        // Call the stored procedure
        const query = "CALL sp_saveCreatePPstaff(?, ?, ?, ?, ?, ?, ?,@PPUserID, @ErrorCode)";
        const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber,EntryUserID];

        // Execute the stored procedure
        await new Promise((resolve, reject) => {
            db.query(query, params, (err, results) => {
                if (err) {
                    console.error("Error executing stored procedure:", err);
                    return ResponseHelper.error(res, "An error occurred while fetching data");
                }
                resolve(results);
            });
        });

        // Fetch the output parameters from the procedure
        const output = await new Promise((resolve, reject) => {
            db.query("SELECT @PPUserID AS PPUserID , @ErrorCode AS ErrorCode", (err, results) => {
                if (err) {
                    console.error("Error fetching output parameters:", err);
                    return ResponseHelper.error(res, "An error occurred while fetching data");
                }
                resolve(results[0]);
            });
        });

        const { PPUserID, ErrorCode } = output;
       

        // Check the output error code from the stored procedure
        if (ErrorCode === 0) { 
            
            return res.status(200).json({
                status: 0,
                message: "PPUser created successfully.",
                data: {
                    id: PPUserID,
                },
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


static async showppuser(req, res) {
    try {
        const query = 'CALL sp_getPPuser()';

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error executing stored procedure:', err);
                return ResponseHelper.error(res, "An error occurred while fetching the staff details.");
            }

            // Assuming your stored procedure returns data in results[0]
            if (results[0] && results[0].length > 0) {
                // Respond with success
                return ResponseHelper.success_reponse(res, "Data found", results[0]);
            } else {
                // Respond with error
                return ResponseHelper.error(res, "No data found");
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return ResponseHelper.error(res, "An unexpected error occurred while fetching the staff details.");
    }
}



static caseDetailsByPPuserId(req, res) {
    // Retrieve the ppuserID from the query parameters or request body
    const ppuserID = req.query.ppuserID;  // Assuming the ppuserID is passed as a query parameter
    
   
    if (!ppuserID) {
        return ResponseHelper.error(res, "ppuserID is required");
    }

    
    const query = 'CALL sp_getCaseDetailsByPPUserId(?)';  // Using the parameterized query

    // Pass the districtId as an argument to the stored procedure
    db.query(query, [ppuserID], (err, results) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return ResponseHelper.error(res, "An error occurred while fetching the case details.");
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


  
   // Assign a case to a PPUser
   
  static assignCasetoppuser(req, res) {
    const { PPUserID, EntryUserID, CaseID } = req.body;

      // Validate required input fields
      if (!PPUserID || !EntryUserID || !CaseID) {
         return ResponseHelper.error(res, "All fields are required: PPUserID, EntryUserID, CaseID.");
      }
      

      // Define the stored procedure call
      const query = "CALL sp_saveCaseAssign(?, ?, ?, @CaseAssignID, @ErrorCode)";
      const params = [PPUserID, EntryUserID, CaseID];

      db.query(query, params, (err) => {
          if (err) {
              console.error("Error executing stored procedure:", err);
              return res.status(500).json({
                  status: 1,
                  message: "An error occurred while assigning the case.",
              });
          }

          // Fetch the output parameters `CaseAssignID` and `ErrorCode`
          db.query("SELECT @CaseAssignID AS CaseAssignID, @ErrorCode AS ErrorCode", (outputErr, outputResults) => {
              if (outputErr) {
                  console.error("Error fetching output parameters:", outputErr);
                  return ResponseHelper.error(res,"Error fetching output parameters:");
              }

              const { CaseAssignID, ErrorCode } = outputResults[0];

              // Check for errors from the stored procedure
              if (ErrorCode === 1) {

                return ResponseHelper.error(res,"An error occurred during case assignment. Please try again.");
                 
              }

              return res.status(200).json({
                  status: 0,
                  message: "Case assigned successfully.",
                  data: {
                    CaseAssignID: CaseAssignID,
                  },
              });
          });
      });
  }



}



module.exports = UserController;
