const DistrictModel = require('../models/DistrictModel'); // Import the model
const ResponseHelper = require('./ResponseHelper'); // Import the response helper

class DistrictController {
  // Controller method to handle /show route
  static show(req, res) {
    DistrictModel.showDistrict((err, results) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return ResponseHelper.error(res, "An error occurred while executing the procedure");
      }

      // Return the results from the model
      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    });
  }

  // Controller method for showing all cases by district ID
  static showAllCasesByDistrict(req, res) {
    const districtId = req.query.districtId;

    if (!districtId) {
      return ResponseHelper.error(res, "districtId is required");
    }

    DistrictModel.showAllCasesByDistrict(districtId, (err, results) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return ResponseHelper.error(res, "An error occurred while fetching data");
      }

      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    });
  }

  // Controller method to get case counts by police station
  static getCaseCountsByPoliceStation(req, res) {
    const districtId = req.query.districtId;

    if (!districtId) {
      return ResponseHelper.error(res, "District ID is required.");
    }

    DistrictModel.getCaseCountsByPoliceStation(districtId, (err, results) => {
      if (err) {
        console.error('Error executing stored procedure:', err);
        return ResponseHelper.error(res, "An error occurred while fetching data");
      }

      return ResponseHelper.success_reponse(res, "Data found", results[0]);
    });
  }
}

module.exports = DistrictController;