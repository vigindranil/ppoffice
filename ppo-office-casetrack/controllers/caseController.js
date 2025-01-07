const db = require("../config/db"); // Import your database connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper
const path = require("path");
const basePath = `D:\\CaseTrack\\ppoffice\\ppo-office-casetrack\\uploads\\`;

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
          return ResponseHelper.success_reponse(res," case assignment found for CaseNumber",results[0]);
    
          
        });

      }
      catch (error) {
        // Handle unexpected errors
        return ResponseHelper.error(res,"An unexpected error occurred.",error);
    } 
}
   

    // create Case without Doc
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
       
  

     
     // create case with Doc 
        static async createCaseDocument(req, res) {
            try {
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
                    photocopycaseDiaryExist,
                    caseDocument
                } = req.body;
    
                // Validate required fields
                if (
                    !CaseNumber ||
                    !EntryUserID ||
                    !CaseDate ||
                    !DistrictID ||
                    !psID ||
                    !caseTypeID ||
                    !ref ||
                    !ipcAct ||
                    !hearingDate ||
                    sendTo === undefined ||
                    copyTo === undefined ||
                    photocopycaseDiaryExist === undefined
                ) {
                    return res.status(400).json({ error: 'Please fill all required fields' });
                }
    
                // Retrieve uploaded document path
                const imagePath = req.file ? path.basename(req.file.path) : null;
    
                // Stored procedure call
                const query = "CALL sp_CreatecaseV1(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @CaseID, @ErrorCode)";
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
                    imagePath, // Pass file path to stored procedure
                ];
    
                // Execute the stored procedure
                await new Promise((resolve, reject) => {
                    db.query(query, params, (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
    
                // Fetch the output parameters `CaseID` and `ErrorCode`
                const outputResults = await new Promise((resolve, reject) => {
                    db.query("SELECT @CaseID AS CaseID, @ErrorCode AS ErrorCode", (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
    
                const { CaseID, ErrorCode } = outputResults[0];
                console.log(CaseID);
                console.log(ErrorCode);
                // Handle possible error codes
                if (ErrorCode === 1) return res.status(400).json({ status : 1,error: 'Procedure execution error' });
                if (ErrorCode === 2) return res.status(400).json({ status : 1,message: 'Case already exists' });
                if (ErrorCode === 3) return res.status(400).json({ status : 1,message: 'User lacks permission to create case' });
    
                // Success response
                return res.status(201).json({
                    status : 0,
                    message: 'Case created successfully',
                    data: { CaseID },
                });
            } catch (error) {
                // Handle unexpected errors
                return res.status(500).json({
                    status : 1,
                    message: 'error.message',
                    
                });
            }


            
        }
    
    
  
    
    
      
 
    // show all case with out Doc
    static async showallCase(req, res) {
        try {
         
          const is_Assigned = req.query.is_Assigned;

       

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

    // show all case with  Doc  
    
    static async showallCaseWithDOC(req, res) {
        try {
            // Extract is_Assigned parameter from the request body
            const { is_Assigned } = req.body;
    
            // Stored procedure query and parameters
            const query = "CALL sp_ShowallCasev1(?)";
            const params = [is_Assigned];
    
            // Execute the stored procedure
            const results = await new Promise((resolve, reject) => {
                db.query(query, params, (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });
    
            // Process the results
            const cases = results[0]; // The first result set contains the data
    
            // Handle logic based on is_Assigned
            if (is_Assigned === null || is_Assigned === undefined) {
                // When is_Assigned is NULL: Return the total number of cases
                const totalCaseCount = cases[0]?.TotalCases || 0; // TotalCases is returned from the stored procedure
                return res.status(200).json({
                    success: true,
                    TotalCaseCount: totalCaseCount,
                });
            } else {
                // When is_Assigned is 1 or 0: Return the cases along with the total count
                if (!cases || cases.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "No cases found.",
                    });
                }
    
                // Extract TotalCaseCount from the first case
                const { TotalCaseCount } = cases[0];
    
                // Format the cases for response
                const formattedCases = cases.map((caseItem) => ({
                    PPuserName: caseItem.PPuserName,
                    CaseNumber: caseItem.CaseNumber,
                    SpName: caseItem.SpName,
                    PsName: caseItem.PsName,
                    CaseDate: caseItem.CaseDate,
                    CaseType: caseItem.CaseType,
                    CaseHearingDate: caseItem.CaseHearingDate,
                    IPCSection: caseItem.IPCSection,
                    ReferenceNumber: caseItem.ReferenceNumber,
                    CaseId: caseItem.CaseId,
                    BeginReferenceName: caseItem.BeginReferenceName,
                    IsAssigned: caseItem.IsAssigned,
                    Document: caseItem?.Document ? `${basePath}${caseItem?.Document}` : null,
                }));
    
                return res.status(200).json({
                    success: true,
                    TotalCaseCount, // Include the total count once
                    data: formattedCases,
                });
            }
        } catch (error) {
            // Handle unexpected errors
            return res.status(500).json({
                success: false,
                error: "Unexpected error occurred.",
                details: error.message,
            });
        }
    }
    

      static async showallCaseBetweenRange(req, res) {
        try {
            const { startDate, endDate,isAssign } = req.body;
    
            
    
            // SQL query to call the stored procedure
            const query = 'CALL sp_ShowallCaseBetweenRange(?, ?,?)';
    
            db.query(query, [startDate, endDate,isAssign], (err, results) => {
                if (err) {
                    console.error("Error executing stored procedure:", err);
                    return ResponseHelper.error(res, "An error occurred while fetching data");
                }
    
                // Assuming your stored procedure returns data in results[0]
                return ResponseHelper.success_reponse(res, "Data found", results[0]);
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred", error);
        }
    }
    
    static async getDashboardCounts(req, res) {
        try {
            const { EntryuserID } = req.body;
    
            // Validate input
            if (!EntryuserID) {
                return ResponseHelper.error(res, "EntryuserID is required");
            }
    
            // Call the stored procedure
            const query = 'CALL sp_DashBoardCount(?)';
    
            db.query(query, [EntryuserID], (err, results) => {
                if (err) {
                    console.error("Error executing stored procedure:", err);
                    return ResponseHelper.error(res, "An error occurred while fetching data");
                }
    
                // Assuming the stored procedure returns results in results[0]
                const caseData = results[0];
    
                // Initialize counts
                let unassignedCases = 0;
                let assignedCases = 0;
                let totalCases = 0;
    
                // Process the results
                caseData.forEach(row => {
                    if (row.caseTypeName === 0) {
                        unassignedCases = row.CaseCount;
                    } else if (row.caseTypeName === 1) {
                        assignedCases = row.CaseCount;
                    }
                    totalCases += row.CaseCount;
                });
    
                // Prepare the response
                const response = {
                   
                    
                      unassignedCases,
                      assignedCases,
                      totalCases
                     
                };
    
                // Send the response
                return ResponseHelper.success_reponse(res, "Counts retrieved successfully", response);
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            return ResponseHelper.error(res, "An unexpected error occurred", error);
        }
    }
    
}



module.exports = CaseController;
