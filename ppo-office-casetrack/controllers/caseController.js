const db = require("../config/db"); // Import your database connection

class CaseController {
    /**
     * Get case assignment details by case number.
     */
    static async getCaseAssign(req, res) {
        const { ppStaffID } = req.query; // Get the CaseNumber from query parameters

        // Validate input
        if (!ppStaffID) {
            return res.status(400).json({
                status: 1,
                message: "ppStaffID is required.",
            });
        }

        try {
            // Call the stored procedure
            const query = "CALL sp_getCaseAssignByPPStaffId(?)";
            const params = [ppStaffID];

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
                message: "Case assignment details retrieved successfully.",
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
    static getcasetype(req, res) {
        const query = 'CALL sp_CasetypeDropdown()';  // Replace with your stored procedure name
    
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

    static saveCase(req, res) {
        const { caseID, ref,ipcAct, hearingDate,photocopycaseDiaryExist } = req.body;
  
        // Validate required input fields
        if (!caseID || !ref || !ipcAct|| !hearingDate || !photocopycaseDiaryExist) {
            return res.status(400).json({
                status: 1,
                message: "All fields are required: caseID, ref, and hearingDate.",
            });
        }
  
        // Define the stored procedure call
        const query = "CALL sp_saveCase(?, ?, ?,?,?, @CaseAssignID, @ErrorCode)";
        const params = [caseID, ref,ipcAct, hearingDate,photocopycaseDiaryExist];
  
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
                    return res.status(500).json({
                        status: 1,
                        message: "An error occurred while fetching procedure output.",
                    });
                }
  
                const { CaseAssignID, ErrorCode } = outputResults[0];
  
                // Check for errors from the stored procedure
                if (ErrorCode === 1) {
                    return res.status(500).json({
                        status: 1,
                        message: "An error occurred during case assignment. Please try again.",
                    });
                }
  
                return res.status(200).json({
                    status: 0,
                    message: "Case updated successfully.",
                    data: {
                      CaseAssignID: CaseAssignID,
                    },
                });
            });
        });
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
}

module.exports = CaseController;
