const db = require("../config/db"); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper

class CaseController {
    /**
     * Get case assignment details by ppStaffID.
     */
    static async getCaseAssign(req, res) {
        const { ppStaffID } = req.query; // Get the CaseNumber from query parameters

        // Validate input
        if (!ppStaffID) {
            return ResponseHelper.error(res, "ppStaffID is  required");
        }

        try {
            // Call the stored procedure
            const query = "CALL sp_getCaseAssignByPPStaffId(?)";
            const params = [ppStaffID];

            // Execute the query
            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) {
                        console.error('Error executing stored procedure:', err);
                        return ResponseHelper.error(res, "An error occurred while validating the PPStaff.");
                    }
                    resolve(results[0]); // The first result set contains the data
                });
            });

            // Check if any record was found
            if (results.length === 0) {
                return ResponseHelper.error(res, "No case assignment found for this PPStaff.");

            }
  
            // Respond with the case assignment details
            return ResponseHelper.success_reponse(res, "Case assignment details retrieved successfully", results[0]);
           
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
                return ResponseHelper.error(res, "An unexpected error occurred while retrieving the case assignment");

            }
            
        }
    }
    static async getcasetype(req, res) {
        const query = 'CALL sp_CasetypeDropdown()'; // Replace with your stored procedure name
    
        try {
            db.query(query, (err, results) => {
                if (err) {
                    console.error('Error executing stored procedure:', err);
                    return ResponseHelper.error(res, "An error occurred while fetching CaseType.");
                }
    
                // Assuming your stored procedure returns data in results[0]
                return ResponseHelper.success_reponse(res, "CaseType found successfully", results[0]);
    
               
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            return ResponseHelper.error(res, "Unexpected error");

        }
    }
    

  
    
    static async getCaseById(req, res) {
        const { CaseID } = req.query; // Get the CaseNumber from query parameters

        // Validate input
        if (!CaseID) {
            return res.status(400).json({
                status: 1,
                message: "caseID is required.",
            });
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
                return res.status(404).json({
                    status: 1,
                    message: `No case assignment found for CaseNumber: ${CaseNumber}`,
                });
            }

            // Respond with the case assignment details
            return res.status(200).json({
                status: 0,
                message: "Case Found.",
                data: results, // Send the fetched data
            });
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
                console.error("Unexpected error:", error);
                return res.status(500).json({
                    status: 1,
                    message: "An unexpected error occurred while retrieving the case assignment.",
                });
            }
        }
    }

    static showRefference(req, res) {
        const query = 'CALL sp_showRefference()';  // Replace with your stored procedure name
    
        db.query(query, (err, results) => {
          if (err) {
            console.error('Error executing stored procedure:', err);
            return res.status(500).json({
              status: 1,
              message: 'Error retrieving data from the database',
              data: []
            });
          }
    
          
          // Assuming your stored procedure returns data in results[0]
          const response = {
            status: 0,
            message: 'data found',
            data: results[0] // The data returned from the stored procedure
          };
    
          // Send the formatted JSON response
          res.json(response);
        });
    } 

   


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
            return res.status(400).json({
                status: 1,
                message: "All fields are required.",
            });
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

            // Success response
            return res.status(201).json({
                status: 0,
                message: "Case created successfully.",
                data: {
                    CaseID: CaseID,
                },
            });
        } catch (error) {
            console.error("Error during case creation:", error);
            return  ResponseHelper.error(res,"An unexpected error occurred while processing the request.");
           
        }
    }

    static async showallCase(req, res) {
        try {
         
    
          // SQL query to call the stored procedure 
          const query = 'CALL sp_ShowallCase()'; 
    
          // Pass the districtId as an argument to the stored procedure
          db.query(query,(err, results) => {
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



module.exports = CaseController;
