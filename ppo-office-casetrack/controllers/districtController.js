// controllers/showController.js
const db = require('../config/db'); // Import the DB connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper

class DistrictController {
  // Handle the GET request for /show (Call stored procedure)
  static show(req, res) {
    const query = 'CALL showDistrict()';  

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return  ResponseHelper.error(res,"An error occurred while executing the procedure");
      }

      
      // Assuming your stored procedure returns data in results[0]
      return  ResponseHelper.success_reponse(res,"Data found",results[0]);
    });
  }

  // show all casesByDistrictId
  static async showallcasesBydistrict(req, res) {
    try {
      // Retrieve the district_id from the query parameters or request body
      const districtId = req.query.districtId; 

      
      if (!districtId) {
        return ResponseHelper.error(res, "districtId is required");
      }

      // SQL query to call the stored procedure with the district_id parameter
      const query = 'CALL sp_ShowallCaseBydistrictID(?)';
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

  static async getCaseCountsByPoliceStation(req, res) {
    try {
        // Get the districtId from the request body
        const { districtId } = req.body;

        // Validate the input
        if (!districtId) {
            return res.status(400).json({ error: 'District ID is required.' });
        }

        // Call the stored procedure
        const query = "CALL sp_CountCasesByPoliceStation(?)";
        const params = [districtId]; // Ensure districtId is an integer

        const results = await new Promise((resolve, reject) => {
            db.query(query, params, (err, result) => {
                if (err) return reject(err);
                resolve(result[0]); // Access the first result set from the procedure
            });
        });

        // Return the data in JSON format
        return res.status(200).json({
            message: 'Case counts by police stations fetched successfully.',
            data: results,
        });
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({
            error: 'Unexpected error occurred.',
            details: error.message,
        });
    }
} 
  
}

module.exports = DistrictController;
