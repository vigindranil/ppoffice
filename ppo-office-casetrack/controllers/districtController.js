// controllers/showController.js
const db = require('../config/db'); // Import the DB connection

class DistrictController {
  // Handle the GET request for /show (Call stored procedure)
  static show(req, res) {
    const query = 'CALL showDistrict()';  // Replace with your stored procedure name

    db.query(query, (err, results) => {
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
        message: 'data found',
        data: results[0] // The data returned from the stored procedure
      };

      // Send the formatted JSON response
      res.json(response);
    });
  }

  // Add other methods if needed
}

module.exports = DistrictController;
