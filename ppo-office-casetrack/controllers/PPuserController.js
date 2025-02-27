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
        return ResponseHelper.error(res, "No data found");
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


  static async assignOrUnAdvocateToCase(req, res) {
    try {
        console.log("🔥 Request Payload:", req.body); // Debugging

        const {
            assignId,    // 0 for new assignment, existing ID for unassigning
            ppUserId,    // Advocate being assigned
            caseId,      // Case ID
            districtId,  // District 0
            psId,        // Police Station 0
            EntryUserId  // Logged-in user assigning the case
          } = req.body;

        // ✅ Validate required input fields
        if (!caseId || !EntryUserId) {
            console.error("❌ Validation failed: Missing required fields.");
            return ResponseHelper.error(res, "Please enter all required fields.");
        }

        // ✅ Define the stored procedure call
        const query = "CALL sp_saveCaseAssignv2(?, ?, ?, ?, ?, ?, @CaseAssignId, @ErrorCode)";
        const params = [assignId, ppUserId, caseId, districtId, psId, EntryUserId];

        console.log("🛠️ Executing Stored Procedure with params:", params);

        // ✅ Execute the stored procedure
        await new Promise((resolve, reject) => {
            db.query(query, params, (err) => {
                if (err) {
                    console.error("❌ Error executing stored procedure:", err);
                    return reject(err);
                }
                resolve();
            });
        });

        // ✅ Fetch the output parameters `CaseAssignId` and `ErrorCode`
        const outputResults = await new Promise((resolve, reject) => {
            db.query("SELECT @CaseAssignId AS CaseAssignId, @ErrorCode AS ErrorCode", (outputErr, results) => {
                if (outputErr) {
                    console.error("❌ Error fetching output parameters:", outputErr);
                    return reject(outputErr);
                }
                resolve(results);
            });
        });

        const { CaseAssignId, ErrorCode } = outputResults[0];

        // ✅ Handle stored procedure errors
        if (ErrorCode === 1) {
            return ResponseHelper.error(res, "An error occurred while executing the procedure.");
        }
        if (ErrorCode === 3) {
            return ResponseHelper.error(res, "Case ID does not exist.");
        }
        if (ErrorCode === 4) {
            return ResponseHelper.error(res, "Cannot unassign the last advocate.");
        }
        if (ErrorCode === 5) {
            return ResponseHelper.error(res, "Logged-in user does not have permission to assign/unassign advocates.");
        }

        // ✅ Success response
        return res.status(201).json({
            status: 0,
            message: assignId === 0 
                ? "Case successfully assigned to advocate."
                : "Advocate successfully unassigned from case.",
            data: { CaseAssignId }
        });

    } catch (error) {
        console.error("❌ Unexpected error:", error);
        return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
    }
  }


  static async getAssignedAdvocatesByCaseId(req, res) {
    try {
        console.log("🔥 Request Params:", req.body); // Debugging

        const { caseId } = req.body;

        // ✅ Validate required input
        if (!caseId) {
            console.error("❌ Validation failed: Missing caseId.");
            return ResponseHelper.error(res, "Please provide a valid caseId.");
        }

        // ✅ Define the stored procedure call
        const query = "CALL sp_getAssignedAdvocatelistByCaseId(?)";
        const params = [caseId];

        console.log("🛠️ Executing Stored Procedure with params:", params);

        // ✅ Execute the stored procedure
        const results = await new Promise((resolve, reject) => {
            db.query(query, params, (err, result) => {
                if (err) {
                    console.error("❌ Error executing stored procedure:", err);
                    return reject(err);
                }
                resolve(result[0]); // ✅ First array contains result set
            });
        });

        // ✅ Check if advocates are found
        if (!results || results.length === 0) {
            return ResponseHelper.error(res, "No advocates found for the given caseId.");
        }

        // ✅ Success response
        return res.status(200).json({
            status: 0,
            message: "Advocates retrieved successfully.",
            data: results
        });

    } catch (error) {
        console.error("❌ Unexpected error:", error);
        return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
    }
  }


  static async getUnassignedAdvocatesByCaseId(req, res) {
    try {
        console.log("🔥 Request Params:", req.body); // Debugging

        const { caseId } = req.body;

        // ✅ Validate required input
        if (!caseId) {
            console.error("❌ Validation failed: Missing caseId.");
            return ResponseHelper.error(res, "Please provide a valid caseId.");
        }

        // ✅ Define the stored procedure call
        const query = "CALL sp_getUnassignedAdvocatelistByCaseId(?)";
        const params = [caseId];

        console.log("🛠️ Executing Stored Procedure with params:", params);

        // ✅ Execute the stored procedure
        const results = await new Promise((resolve, reject) => {
            db.query(query, params, (err, result) => {
                if (err) {
                    console.error("❌ Error executing stored procedure:", err);
                    return reject(err);
                }
                resolve(result[0]); // ✅ First array contains result set
            });
        });

        // ✅ Check if any unassigned advocates are found
        if (!results || results.length === 0) {
            return ResponseHelper.error(res, "No unassigned advocates found for the given caseId.");
        }

        // ✅ Success response
        return res.status(200).json({
            status: 0,
            message: "Unassigned advocates retrieved successfully.",
            data: results
        });

    } catch (error) {
        console.error("❌ Unexpected error:", error);
        return ResponseHelper.error(res, "An unexpected error occurred while processing the request.", error);
    }
  }


}

module.exports = PPuserController;
