const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper'); 
class UserController {
  static createPPStaff(req, res) {
    const { Username, UserPassword, FullName, ContractNo, Email, LicenseNumber } = req.body;
    
    // Validate the required input fields
    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
        return res.status(400).json({
            status: 1,
            message: "All fields are required: Username, UserPassword, FullName, ContractNo, Email, and LicenseNumber.",
        });
    }

    // Call the stored procedure
    const query = "CALL sp_saveCreatePPstaff(?, ?, ?, ?, ?, ?, @ppstaff_id, @ErrorCode)";
    const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber];

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Error executing stored procedure:", err);
            return res.status(500).json({
                status: 1,
                message: "An error occurred while creating the PP staff.",
            });
        }

        // Fetch output parameters from the procedure
        db.query("SELECT @ppstaff_id AS ppstaff_id, @ErrorCode AS ErrorCode", (outputErr, outputResults) => {
            if (outputErr) {
                console.error("Error fetching output parameters:", outputErr);
                return res.status(500).json({
                    status: 1,
                    message: "An error occurred while fetching procedure output.",
                });
            }

            const { ppstaff_id, ErrorCode } = outputResults[0];

            if (ErrorCode === 0) {
                return res.status(200).json({
                    status: 0,
                    message: "PP Staff created successfully.",
                    data: {
                        id: ppstaff_id,
                    },
                });
            } else {
                return res.status(400).json({
                    status: 1,
                    message: "Failed to create PP Staff. Please check your input.",
                });
            }
        });
    });
}

  static showppstaff(req, res) {
    const query = 'CALL sp_getPPstaff()';  

    db.query(query, (err, results) => {
      if (err) {
          console.error('Error executing stored procedure:', err);
          return ResponseHelper.error(res, "An error occurred while fetching the staff details.");
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


static ppdetailsbyId(req, res) {
    // Retrieve the district_id from the query parameters or request body
    const ppstaffId = req.query.ppstaffId;  // Assuming the district_id is passed as a query parameter
    
   
    if (!ppstaffId) {
      return res.status(400).json({
        status: 1,
        message: 'ppstaff_id is required',
        data: []
      });
    }

    // SQL query to call the stored procedure with the district_id parameter
    const query = 'CALL sp_getPPstaffDetailsbyId(?)';  // Using the parameterized query

    // Pass the districtId as an argument to the stored procedure
    db.query(query, [ppstaffId], (err, results) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return ResponseHelper.error(res, "An error occurred while fetching the staff details.");
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


  /**
   * Assign a case to a PP staff
   */
  static assignCase(req, res) {
      const { PPstaffID, CaseNumber, CaseDate } = req.body;

      // Validate required input fields
      if (!PPstaffID || !CaseNumber || !CaseDate) {
          return res.status(400).json({
              status: 1,
              message: "All fields are required: PPstaffID, CaseNumber, and CaseDate.",
          });
      }

      // Define the stored procedure call
      const query = "CALL sp_saveCaseAssign(?, ?, ?, @CaseAssignID, @ErrorCode)";
      const params = [PPstaffID, CaseNumber, CaseDate];

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
