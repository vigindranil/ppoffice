const { db } = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper'); 
class PsController {

    // create ps staff by Sp
    static async createPsStaff (req, res) 
    {
     const { Username, UserPassword, FullName,ContractNo, Email, LicenseNumber, EntryUserID, PsID } = req.body;

    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber || !EntryUserID || !PsID) {
      
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
  // static async showallcasesBypoliceID(req, res) {
  //   try {
  //     // Retrieve the psId from the query parameters or request body
  //     const psId = req.query.psId; 

      
  //     if (!psId) {
  //       return ResponseHelper.error(res, "psId is required");
  //     }

  //     // SQL query to call the stored procedure with the district_id parameter
  //     const query = 'CALL sp_ShowallCaseBypoliceID(?)';
  //     // Pass the districtId as an argument to the stored procedure
  //     db.query(query, [psId], (err, results) => {
  //       if (err) {
  //         console.error('Error executing stored procedure:', err);
  //         return ResponseHelper.error(res, "An error occurred while fetching data");
  //       }

  //       // Assuming your stored procedure returns data in results[0]
  //       return ResponseHelper.success_reponse(res, "Data found", results[0]);
  //     });
  //   } catch (error) {
  //     console.error('Unexpected error:', error);
  //     return ResponseHelper.error(res, "An unexpected error occurred");
  //   }
  // } 

  static async showallcasesBypoliceID(req, res) {
    try {
      const { psId, EntryUserID } = req.body;
  
      if (!psId || !EntryUserID) {
        return ResponseHelper.error(res, "Both psId and EntryUserID are required");
      }
  
      const mainQuery = "CALL sp_ShowallCaseBypoliceID(?,?)";
      const mainParams = [psId,EntryUserID];
  
      // Step 1: Get all cases for the given PS ID
      const [caseResults] = await new Promise((resolve, reject) => {
        db.query(mainQuery, mainParams, (err, results) => {
          if (err) {
            console.error("Error executing sp_ShowallCaseBypoliceID:", err);
            return reject(err);
          }
          resolve(results);
        });
      });
  
      // Step 2: Enrich each case with references and IPC sections
      const enrichedCases = await Promise.all(
        caseResults.map(async (caseItem) => {
          const { CaseId, UserId } = caseItem;
  
          // Reference numbers
          const references = await new Promise((resolve, reject) => {
            db.query(
              "CALL sp_getRefferenceNumberByCaseId(?, ?)",
              [CaseId, UserId || EntryUserID],
              (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
              }
            );
          });
  
          // IPC Sections
          const ipcSections = await new Promise((resolve, reject) => {
            db.query(
              "CALL sp_getIpcSectionByCaseId(?, ?)",
              [CaseId, UserId || EntryUserID],
              (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
              }
            );
          });
  
          return {
            ...caseItem,
            references,
            ipcSections,
          };
        })
      );
  
      return ResponseHelper.success_reponse(res, "Data found", enrichedCases);
    } catch (error) {
      console.error("Unexpected error:", error);
      return ResponseHelper.error(res, "An unexpected error occurred", error);
    }
  }  

  static async showpsuserById(req, res) {
    try {
      // Retrieve the PSUserId from the query parameters
      const {PSUserId} =  req.body;

      if (!PSUserId) {
        return ResponseHelper.error(res, "PSUserId is required");
      }

      // SQL query to call the stored procedure with the EntryuserID parameter
      const query = 'CALL sp_getPSUserDetailsbyId(?)';
      db.query(query, [PSUserId], (err, results) => {
        if (err) {
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }
        if (results[0] && results[0].length > 0) 
        {
            return ResponseHelper.success_reponse(res, "Data found", results[0]);
        }
       
      });
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }  

  static async showallpsBydistrict(req, res) {
    try {
      // Retrieve the district_id from the query parameters or request body
      const districtId = req.query.districtId;

      //console.log('Received districtId:', districtId);
      if (!districtId) {
        return ResponseHelper.error(res, "districtId is required");
      }

      // SQL query to call the stored procedure with the district_id parameter
      const query = 'CALL GetPoliceStationsByDistrict(?)'; // Using the parameterized query

      // Pass the districtId as an argument to the stored procedure
      db.query(query, [districtId], (err, results) => {
        if (err) {
         
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        // Assuming your stored procedure returns data in results[0]
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      });
    } catch (error) {
      
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  } 
  
  
}



module.exports = PsController;
