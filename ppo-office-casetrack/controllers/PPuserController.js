const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper');

class PPuserController {
  static async createPPUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber } = req.body;

    // Validate the required input fields
    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber are required");
    }

    try {
      // Call the stored procedure
      const query = "CALL sp_saveCreatePPuser(?, ?, ?, ?, ?, ?, ?, @PPUserID, @ErrorCode)";
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
        db.query("SELECT @PPUserID AS PPUserID, @ErrorCode AS ErrorCode", (err, results) => {
          if (err) {
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
          data: { id: PPUserID },
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

  // PP head can see PPUser
  static async showppuser(req, res) {
    try {
      // Retrieve the EntryUserID from the query parameters
      const EntryuserID = req.query.EntryuserID;

      if (!EntryuserID) {
        return ResponseHelper.error(res, "EntryuserID is required");
      }

      // SQL query to call the stored procedure with the EntryuserID parameter
      const query = 'CALL sp_getPPuser(?)';
      db.query(query, [EntryuserID], (err, results) => {
        if (err) {
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }
        if (results[0] && results[0].length > 0) 
        {
            return ResponseHelper.success_reponse(res, "Data found", results[0]);
        }
        else
        {
            return ResponseHelper.error(res, "logged in user no acess to see ppuser list");
        }
      });
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  // PP user can see their assigned cases
  static caseDetailsByPPuserId(req, res) {
    const ppuserID = req.query.ppuserID;
  
    if (!ppuserID) {
      return ResponseHelper.error(res, "ppuserID is required");
    }
  
    const query = 'CALL sp_getCaseDetailsByPPUserId(?)';
    db.query(query, [ppuserID], (err, results) => {
      if (err) {
        return ResponseHelper.error(res, "An error occurred while fetching the case details.");
      }
  
      if (results[0] && results[0].length > 0) {
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      } else {
        // Even if no data is returned, send a success response with status 0.
        return ResponseHelper.success_reponse(res, "No Data Found, please check", []);
      }
    });
  }
  

  // Assign a case to a PPUser by PP head
  static assignCasetoppuser(req, res) {
    const { PPUserID, EntryUserID, CaseID } = req.body;

    if (!PPUserID || !EntryUserID || !CaseID) {
      return ResponseHelper.error(res, "All fields are required: PPUserID, EntryUserID, CaseID.");
    }

    const query = "CALL sp_saveCaseAssign(?, ?, ?, @CaseAssignID, @ErrorCode)";
    const params = [PPUserID, EntryUserID, CaseID];

    db.query(query, params, (err) => {
      if (err) {
        return ResponseHelper.error(res, "An error occurred while assigning the case.");
      }

      db.query("SELECT @CaseAssignID AS CaseAssignID, @ErrorCode AS ErrorCode", (outputErr, outputResults) => {
        if (outputErr) {
          return ResponseHelper.error(res, "Error fetching output parameters:");
        }

        const { CaseAssignID, ErrorCode } = outputResults[0];

        switch (ErrorCode) {
          case 0:
            return res.json({
              status: 0,
              message: "Case assigned successfully.",
              data: { CaseAssignID },
            });
          case 1:
            return ResponseHelper.error(res, "An error occurred during case assignment. Please try again.");
          case 2:
            return ResponseHelper.error(res, "Case Already Assigned");
          case 3:
            return ResponseHelper.error(res, "CaseID invalid");
          case 4:
            return ResponseHelper.error(res, "Logged in user is invalid");
          case 5:
            return ResponseHelper.error(res, "Logged in user has no permission to assign case");
          default:
            return ResponseHelper.error(res, "An unknown error occurred");
        }
      });
    });
  }

  // PPUser can see PP details
  static async getppuserDetailsById(req, res) {
    try {
      const PPUserId = req.query.PPUserId;

      if (!PPUserId) {
        return ResponseHelper.error(res, "PPUserId is required");
      }

      const query = 'CALL sp_getPPUserDetailsbyId(?)';
      db.query(query, [PPUserId], (err, results) => {
        if (err) {
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      });
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }
}

module.exports = PPuserController;
