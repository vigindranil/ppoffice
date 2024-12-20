const db = require("../config/db"); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper

class CaseController {
    

    // Show all CaseType
    static async getcasetype(req, res) {
        const query = 'CALL sp_CasetypeDropdown()'; 
    
        try {
            db.query(query, (err, results) => {
                if (err) {
                   
                    return ResponseHelper.error(res, "An error occurred while fetching CaseType.");
                }
    
                // Assuming your stored procedure returns data in results[0]
                return ResponseHelper.success_reponse(res, "CaseType found successfully", results[0]);
    
               
            });
        } catch (error) {
          
            return ResponseHelper.error(res, "Unexpected error",error);

        }
    }
    

  
    
    static async getCaseById(req, res) {
        const { CaseID } = req.query; // Get the CaseNumber from query parameters

        // Validate input
        if (!CaseID) {
            return ResponseHelper.error(res, "CaseID is required.");

        }

        try {
            // Call the stored procedure
            const query = "CALL sp_getCaseDetailsByCaseId(?)";
            const params = [CaseID];

            // Execute the query
            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) {
                        console.error("SQL Error executing stored procedure:", err);
                        return reject({ sqlError: true, error: err });
                    }
                    resolve(results[0]); // The first result set contains the data
                });
            });

            // Check if any record was found
            if (results.length === 0) {

                return ResponseHelper.error(res,"No case assignment found for CaseNumber");
               
            }
             // Respond with the case assignment details
            return ResponseHelper.success_reponse(res," case assignment found for CaseNumber",results);
           
           
        } catch (error) {
            if (error.sqlError) {
                // SQL-specific error handling
                return res.status(500).json({
                    status: 1,
                    message: "A database error occurred while processing your request.",
                    error: {
                        sqlState: error.error.sqlState || null,
                        code: error.error.code || null,
                        message: error.error.message || "Unknown SQL error",
                    },
                });
            } else {
                // General error handling
                return ResponseHelper.error(res,"An unexpected error occurred while retrieving the case assignment.");
                
            }
        }
    }
 
    // show Refference Details
    static showRefference(req, res) {
        const query = 'CALL sp_showRefference()';  // Replace with your stored procedure name
    
      try {
        db.query(query, (err, results) => {
          if (err) {
            return ResponseHelper.error(res,"An unexpected error occurred while retrieving Data.",err);
          }
    
          
          // Assuming your stored procedure returns data in results[0]
          return ResponseHelper.success_reponse(res," case assignment found for CaseNumber",results);
    
          
        });

      }
      catch (error) {
        // Handle unexpected errors
        return ResponseHelper.error(res,"An unexpected error occurred.",error);
    } 
}
   

    // create case by PPoffice
    static async createCase(req, res) {
        const {
            CaseNumber,
            EntryUserID,
            CaseDate,
            DistrictID,
            psID,
            caseTypeID,
            ref,
            ipcAct,
            hearingDate,
            sendTo,
            copyTo,
            photocopycaseDiaryExist
        } = req.body;

        // Validate required input fields
        if (
            !CaseNumber || !EntryUserID || !CaseDate || !DistrictID || !psID ||
            !caseTypeID || !ref || !ipcAct || !hearingDate || sendTo === undefined ||
            copyTo === undefined || photocopycaseDiaryExist === undefined )
            {
                return ResponseHelper.error(res, "please  entry all required feild ");
           
        }

        try {
            // Define the stored procedure call
            const query = "CALL sp_Createcase(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
            const params = [
                CaseNumber,
                EntryUserID,
                CaseDate,
                DistrictID,
                psID,
                caseTypeID,
                ref,
                ipcAct,
                hearingDate,
                sendTo,
                copyTo,
                photocopycaseDiaryExist,
            ];

            // Execute the stored procedure
            await new Promise((resolve, reject) => {
                db.query(query, params, (err) => {
                    if (err) {
                        return  ResponseHelper.error(res,"An error occurred while executing the procedure");
                    }
                    resolve();
                });
            });

            // Fetch the output parameters `CaseID` and `ErrorCode`
            const outputResults = await new Promise((resolve, reject) => {
                db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (outputErr, results) => {
                    if (outputErr) {
                        return  ResponseHelper.error(res,"An error occurred while executing the procedure");
                    }
                    resolve(results);
                });
            });

            const { CaseID, ErrorCode } = outputResults[0];

            // Check for errors from the stored procedure
            if (ErrorCode === 1) {
               
                return  ResponseHelper.error(res,"An error occurred while executing the procedure");
            }
            if (ErrorCode === 2) {
               
                return  ResponseHelper.error(res,"Case Already Created ");
            }
            
            if (ErrorCode === 3) {
               
                return  ResponseHelper.error(res,"Loggedin user no permission to create case ");
            }
            // Success response
            return res.status(201).json({
                status: 0,
                message: "Case created successfully.",
                data: {
                    CaseID: CaseID,
                },
            });
        } catch (error) {
           
            return  ResponseHelper.error(res,"An unexpected error occurred while processing the request.",error);
           
        }
    }
 
 
 
    // show all case
    static async showallCase(req, res) {
        try {
         
          const is_Assigned = req.query.is_Assigned;

          if (!is_Assigned) {
            return ResponseHelper.error(res, "Assign Id is required");
          }

          // SQL query to call the stored procedure 
          const query = 'CALL sp_ShowallCase(?)'; 
    
          
          db.query(query,[is_Assigned],(err, results) => {
            if (err) {
            
              return ResponseHelper.error(res, "An error occurred while fetching data");
            }
    
            // Assuming your stored procedure returns data in results[0]
            return ResponseHelper.success_reponse(res, "Data found", results[0]);
          });
        } catch (error) {
          
          return ResponseHelper.error(res, "An unexpected error occurred",error);
        }
      }
    
}



module.exports = CaseController;
