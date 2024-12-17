// controllers/showController.js
const db = require('../config/db'); // Import the DB connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper

class DistrictController {
  // Handle the GET request for /show (Call stored procedure)
  static show(req, res) {
    const query = 'CALL showDistrict()';  // Replace with your stored procedure name

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return  ResponseHelper.error(res,"An error occurred while executing the procedure");
      }

      
      // Assuming your stored procedure returns data in results[0]
      return  ResponseHelper.success_reponse(res,"Data found",results[0]);
    });
  }

  
}

module.exports = DistrictController;
