const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper'); 
class notificationController {


  static async showMailDetailsById(req, res) {
    try {
      // Retrieve the parameters from the request body
      const { authorityTypeId, boundaryId } = req.body;
  
      if (!authorityTypeId || !boundaryId) {
        return ResponseHelper.error(res, "authorityTypeId and boundaryId are required");
      }
  
      // SQL query to call the stored procedure
      const query = 'CALL sp_mailDetails_byID(?, ?)';
      const params = [authorityTypeId, boundaryId];
  
      db.query(query, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }
  
        if (results[0] && results[0].length > 0) {
          return ResponseHelper.success_reponse(res, "Data found", results[0]);
        } else {
          return ResponseHelper.success_reponse(res, "No data found");
        }
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  static async checkMailRead(req, res) {
    try {
      // Retrieve the necessary parameters from the request body
      const { mailId, CaseId, authorityTypeId, boundaryId } = req.body;

      // Validate input parameters
      if (!mailId || !CaseId || !authorityTypeId || !boundaryId) {
        return ResponseHelper.error(res, 'mailId, caseId, authorityTypeId, and boundaryId are required');
      }

      // SQL query to call the stored procedure
      const query = 'CALL sp_checkmail_Read(?, ?, ?, ?)';
      const params = [mailId, CaseId, authorityTypeId, boundaryId];

      // Execute the query
      db.query(query, params, (err, results) => {
        if (err) {
          // Return an error response if the query fails
          return ResponseHelper.error(res, 'An error occurred while checking the mail',err);
        }

        // If the stored procedure executes successfully, return the result
        return ResponseHelper.success_reponse(res, 'Mail checked and updated successfully', results);
      });
    } catch (error) {
      // Catch any unexpected errors
      return ResponseHelper.error(res, 'An unexpected error occurred');
    }
  }
  

  
  
}



module.exports = notificationController;
