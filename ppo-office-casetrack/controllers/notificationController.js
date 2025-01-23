// controllers/NotificationController.js

const NotificationModel = require('../models/NotificationModel');
const ResponseHelper = require('./ResponseHelper');

class NotificationController {
  static async showMailDetailsById(req, res) {
    try {
      // Retrieve the parameters from the request body
      const { authorityTypeId, boundaryId } = req.body;

      if (!authorityTypeId || !boundaryId) {
        return ResponseHelper.error(res, "authorityTypeId and boundaryId are required");
      }

      // Call the model method to get mail details
      const results = await NotificationModel.getMailDetails(authorityTypeId, boundaryId);

      if (results && results.length > 0) {
        return ResponseHelper.success_reponse(res, "Data found", results);
      } else {
        return ResponseHelper.success_reponse(res, "No data found");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      return ResponseHelper.error(res, "An unexpected error occurred");
    }
  }

  static async checkMailRead(req, res) {
    try {
      // Retrieve the necessary parameters from the request body
      const { mailId, caseId, authorityTypeId, boundaryId } = req.body;

      // Validate input parameters
      if (!mailId || !caseId || !authorityTypeId || !boundaryId) {
        return ResponseHelper.error(res, 'mailId, caseId, authorityTypeId, and boundaryId are required');
      }

      // Call the model method to check the mail status
      const results = await NotificationModel.checkMailRead(mailId, caseId, authorityTypeId, boundaryId);

      return ResponseHelper.success_reponse(res, 'Mail checked and updated successfully', results);
    } catch (error) {
      // Catch any unexpected errors
      console.error("Unexpected error:", error);
      return ResponseHelper.error(res, 'An unexpected error occurred');
    }
  }
}

module.exports = NotificationController;