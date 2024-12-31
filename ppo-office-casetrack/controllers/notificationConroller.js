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
          return ResponseHelper.error(res, "No data found");
        }
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }
  

  
  
}



module.exports = notificationController;
