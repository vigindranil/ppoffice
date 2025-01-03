const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper');

class SuperAdminController {

  // super Admin add PPAdmin user
  static async createPPOfficeAdminUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber } = req.body;

    // Validate the required input fields
    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber are required");
    }

    try {
      // Call the stored procedure
      const query = "CALL sp_saveCreateppofficeAdmin(?, ?, ?, ?, ?, ?, ?, @PPofficeAdminID, @ErrorCode)";
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
        db.query("SELECT @PPofficeAdminID AS PPofficeAdminID, @ErrorCode AS ErrorCode", (err, results) => {
          if (err) {
            return ResponseHelper.error(res, "An error occurred while fetching data");
          }
          resolve(results[0]);
        });
      });

      const { PPofficeAdminID, ErrorCode } = output;

      // Check the output error code from the stored procedure
      if (ErrorCode === 0) {

        return ResponseHelper.success_reponse(res,"PPOfficeAdmin user created successfully",{ id: PPofficeAdminID });
       
      } 
      if (ErrorCode === 4) {

        return ResponseHelper.success_reponse(res,"Login user is invalid");
       
      }
      if (ErrorCode === 5) {

        return ResponseHelper.success_reponse(res,"log in user has no permission to add user");
       
      }
      else {
         return ResponseHelper.error(res,"Failed to create PPOfficeAdmin. Please check your input.",err);
        
      }
    } catch (error) {
     
      return ResponseHelper.error(res,"An unexpected error occurred while creating the PPOfficeAdmin.",error);

    }
  }


  static async createPPHeadUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber } = req.body;

    // Validate the required input fields
    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber are required");
    }

    try {
      // Call the stored procedure
      const query = "CALL sp_saveCreateppofficeHead(?, ?, ?, ?, ?, ?, ?, @PPofficeHeadID, @ErrorCode)";
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
        db.query("SELECT @PPofficeHeadID AS PPofficeHeadID, @ErrorCode AS ErrorCode", (err, results) => {
          if (err) {
            return ResponseHelper.error(res, "An error occurred while fetching data");
          }
          resolve(results[0]);
        });
      });

      const { PPofficeHeadID, ErrorCode } = output;
     
      // Check the output error code from the stored procedure
      if (ErrorCode === 4) {

        return ResponseHelper.success_reponse(res,"Login user is invalid");
       
      }

      if (ErrorCode === 5) {

        return ResponseHelper.success_reponse(res,"log in user has no permission to add user");
       
      }
      
      else if (ErrorCode === 0) {

        return ResponseHelper.success_reponse(res,"PPHead user created successfully",{ id: PPofficeHeadID });
       
      }
      
      else {
         return ResponseHelper.error(res,"Failed to create PPHead. Please check your input.",err);
        
      }
    } catch (error) {
     
      return ResponseHelper.error(res,"An unexpected error occurred while creating the PPHead.",error);

    }
  }

  
  static async createSPUser(req, res) {
    const { Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber,DistrictID } = req.body;

    // Validate the required input fields
    if (!Username || !UserPassword || !FullName || !ContractNo || !Email || !LicenseNumber || !DistrictID) {
      return ResponseHelper.error(res, "Username, UserPassword, EntryUserID, FullName, ContractNo, Email, LicenseNumber, DistrictID  are required");
    }

    try {
      // Call the stored procedure
      const query = "CALL sp_saveCreatSpuser(?, ?, ?, ?, ?, ?, ?, ?, @SPID, @ErrorCode)";
      const params = [Username, UserPassword, FullName, ContractNo, Email, LicenseNumber, EntryUserID,DistrictID];

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
        db.query("SELECT @SPID AS SPID, @ErrorCode AS ErrorCode", (err, results) => {
          if (err) {
            return ResponseHelper.error(res, "An error occurred while fetching data");
          }
          resolve(results[0]);
        });
      });

      const { SPID, ErrorCode } = output;
     
      // Check the output error code from the stored procedure
      if (ErrorCode === 4) {

        return ResponseHelper.success_reponse(res,"Login user is invalid");
       
      }

      if (ErrorCode === 5) {

        return ResponseHelper.success_reponse(res,"log in user has no permission to add user");
       
      }
      
      else if (ErrorCode === 0) {

        return ResponseHelper.success_reponse(res,"SP user created successfully",{ id: SPID });
       
      }
      
      else {
         return ResponseHelper.error(res,"Failed to create PPHead. Please check your input.",err);
        
      }
    } catch (error) {
     
      return ResponseHelper.error(res,"An unexpected error occurred while creating the PPHead.",error);

    }
  }

  static async showppofficeAdminUser(req, res) {
    try {
      // Retrieve the EntryUserID from the query parameters
      const {EntryuserID} =  req.body;

      if (!EntryuserID) {
        return ResponseHelper.error(res, "EntryuserID is required");
      }

      // SQL query to call the stored procedure with the EntryuserID parameter
      const query = 'CALL sp_getPPOfficeAdminuser(?)';
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
            return ResponseHelper.error(res, "logged in user no acess to see ppAdminuser list");
        }
      });
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }
  
  static async showppofficeHeadnUser(req, res) {
    try {
      // Retrieve the EntryUserID from the query parameters
      const {EntryuserID} =  req.body;

      if (!EntryuserID) {
        return ResponseHelper.error(res, "EntryuserID is required");
      }

      // SQL query to call the stored procedure with the EntryuserID parameter
      const query = 'CALL sp_getHeadppofficeuser(?)';
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
            return ResponseHelper.error(res, "logged in user no acess to see ppHeaduser list");
        }
      });
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }
  

  static async showspUser(req, res) {
    try {
      // Retrieve the EntryUserID from the query parameters
      const {EntryuserID,DistrictID} =  req.body;

      if (!EntryuserID || !DistrictID) {
        return ResponseHelper.error(res, "EntryuserID is required");
      }

      // SQL query to call the stored procedure with the EntryuserID parameter
      const query = 'CALL sp_getSPuser(?,?)';
      const params = [EntryuserID,DistrictID];
      db.query(query, params, (err, results) => {
        if (err) {
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }
        
        if (results[0] && results[0].length > 0) 
        {
            return ResponseHelper.success_reponse(res, "Data found", results[0]);
        }
        else
        {
            return ResponseHelper.error(res, "logged in user no acess to see sp list");
        }
      });
    } catch (error) {
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }
}

module.exports = SuperAdminController;
