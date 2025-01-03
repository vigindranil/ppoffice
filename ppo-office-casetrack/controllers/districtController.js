// Import the required modules
const db = require('../config/db'); // Import the DB connection
const ResponseHelper = require('./ResponseHelper'); // Import the helper
const logger = require('../utils/logger'); // Import the logger

class DistrictController {
  // Handle the GET request for /show (Call stored procedure)
  static show(req, res) {
    const query = 'CALL showDistrict()';

    db.query(query, (err, results) => {
      if (err) {
        logger.error('Error executing stored procedure in show():', { error: err.message });
        return ResponseHelper.error(res, "An error occurred while executing the procedure");
      }

      logger.info('show() executed successfully.');
      // Assuming your stored procedure returns data in results[0]
      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    });
  }

  // show all casesByDistrictId
  static async showallcasesBydistrict(req, res) {
    try {
      // Retrieve the district_id from the query parameters or request body
      const districtId = req.query.districtId;

      if (!districtId) {
        logger.warn('Missing districtId in showallcasesBydistrict()');
        return ResponseHelper.error(res, "districtId is required");
      }

      // SQL query to call the stored procedure with the district_id parameter
      const query = 'CALL sp_ShowallCaseBydistrictID(?)';

      // Pass the districtId as an argument to the stored procedure
      db.query(query, [districtId], (err, results) => {
        if (err) {
          logger.error('Error executing stored procedure in showallcasesBydistrict():', { error: err.message, districtId });
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        logger.info('showallcasesBydistrict() executed successfully.', { districtId });
        // Assuming your stored procedure returns data in results[0]
        return ResponseHelper.success_reponse(res, "Data found", results[0]);
      });
    } catch (error) {
      logger.error('Unexpected error in showallcasesBydistrict():', { error: error.message });
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }
}

module.exports = DistrictController;
