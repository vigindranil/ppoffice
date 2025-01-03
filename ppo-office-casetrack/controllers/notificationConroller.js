const db = require('../config/db'); // Import the database connection
const ResponseHelper = require('./ResponseHelper');
const logger = require('../utils/logger');  // Importing the logger

class NotificationController {
  static async showMailDetailsById(req, res) {
    try {
      // Retrieve the parameters from the request body
      const { authorityTypeId, boundaryId } = req.body;

      if (!authorityTypeId || !boundaryId) {
        logger.warn("Missing required parameters: authorityTypeId or boundaryId");
        return ResponseHelper.error(res, "authorityTypeId and boundaryId are required");
      }

      // SQL query to call the stored procedure
      const query = 'CALL sp_mailDetails_byID(?, ?)';
      const params = [authorityTypeId, boundaryId];

      db.query(query, params, (err, results) => {
        if (err) {
          logger.error("Error executing query for showMailDetailsById:", err);
          return ResponseHelper.error(res, "An error occurred while fetching data");
        }

        if (results[0] && results[0].length > 0) {
          logger.info("Data found for showMailDetailsById");
          return ResponseHelper.success_reponse(res, "Data found", results[0]);
        } else {
          logger.warn("No data found for showMailDetailsById");
          return ResponseHelper.error(res, "No data found");
        }
      });
    } catch (error) {
      logger.error("Unexpected error in showMailDetailsById:", error);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  static async checkMailRead(req, res) {
    try {
      // Retrieve the necessary parameters from the request body
      const { mailId, caseId, authorityTypeId, boundaryId } = req.body;

      // Validate input parameters
      if (!mailId || !caseId || !authorityTypeId || !boundaryId) {
        logger.warn("Missing required parameters: mailId, caseId, authorityTypeId, or boundaryId");
        return ResponseHelper.error(res, 'mailId, caseId, authorityTypeId, and boundaryId are required');
      }

      // SQL query to call the stored procedure
      const query = 'CALL sp_checkmail_Read(?, ?, ?, ?)';
      const params = [mailId, caseId, authorityTypeId, boundaryId];

      // Execute the query
      db.query(query, params, (err, results) => {
        if (err) {
          logger.error("Error executing query for checkMailRead:", err);
          return ResponseHelper.error(res, 'An error occurred while checking the mail', err);
        }

        logger.info("Mail checked and updated successfully in checkMailRead");
        return ResponseHelper.success_reponse(res, 'Mail checked and updated successfully', results);
      });
    } catch (error) {
      logger.error("Unexpected error in checkMailRead:", error);
      return ResponseHelper.error(res, 'An unexpected error occurred');
    }
  }
}

module.exports = NotificationController;
