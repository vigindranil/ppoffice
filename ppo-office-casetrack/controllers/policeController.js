// controllers/showController.js
const db = require('../config/db'); // Import the DB connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper

class PoliceController {
  // Handle the GET request for /show (Call stored procedure with district_id)
  static async showallpsBydistrict(req, res) {
    try {
      // Retrieve the district_id from the query parameters or request body
      const districtId = req.query.districtId; // Assuming the district_id is passed as a query parameter

      //console.log('Received districtId:', districtId);
      if (!districtId) {
        return ResponseHelper.error(res, "districtId is required");
      }

      // SQL query to call the stored procedure with the district_id parameter
      const query = 'CALL GetPoliceStationsByDistrict(?)'; // Using the parameterized query

      // Pass the districtId as an argument to the stored procedure
      db.query(query, [districtId], (err, results) => {
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


module.exports = PoliceController;
