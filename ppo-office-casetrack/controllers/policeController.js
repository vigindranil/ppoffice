// controllers/showController.js
const db = require('../config/db'); // Import the DB connection

class PoliceController {
  // Handle the GET request for /show (Call stored procedure with district_id)
  static showallpsBydistrict(req, res) {
    // Retrieve the district_id from the query parameters or request body
    const districtId = req.query.districtId;  // Assuming the district_id is passed as a query parameter
    
    console.log('Received districtId:', districtId);
    if (!districtId) {
      return res.status(400).json({
        status: 1,
        message: 'district_id is required',
        data: []
      });
    }

    // SQL query to call the stored procedure with the district_id parameter
    const query = 'CALL GetPoliceStationsByDistrict(?)';  // Using the parameterized query

    // Pass the districtId as an argument to the stored procedure
    db.query(query, [districtId], (err, results) => {
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
        message: 'Data found',
        data: results[0] // The data returned from the stored procedure
      };

      // Send the formatted JSON response
      res.json(response);
    });
  }

  // Add other methods if needed
}

module.exports = PoliceController;
